
import { Controller, NotFoundException, BadRequestException, InternalServerErrorException, UseGuards, ConflictException } from "@nestjs/common";
import { Ctx, MessagePattern, Payload } from "@nestjs/microservices";
import { Connection, PaginateOptions } from "mongoose";
import { AuthGuard } from "src/auth/auth.guard";
import { InitiateSubscriptionDto } from "./dto/create-enrollment.dto";
import { SubscriptionType } from "src/utils/enums/subscriptionType.enum";
import { RpcValidationPipe } from "src/utils/RpcValidationPipe";
import { InjectConnection } from "@nestjs/mongoose";
import { CourseService } from "src/course/course.service";
import { SubscriptionStatus } from "src/utils/enums/subscriptionStatus.enum";
import { Currency } from "src/payment/enums/currency.enum";
import { IUserContext } from "src/utils/types/IUserContext.interface";
import { EnrollmentService } from "./enrollment.service";
import { WalletService } from "src/wallet/wallet.service";
import { Organization } from "src/organization/entities/organization.entity";
import { Course } from "src/course/entities/course.entity";
import { PaginateOptionsWithSearch } from "src/utils/types/PaginateOptionsWithSearch";
import { handleRpcError } from "src/utils/errorHandling";

interface PopulatedCourse extends Course {
    organization: Organization;
}



@Controller()
export class EnrollmentMessageController {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly courseService: CourseService,
        private readonly enrollmentService: EnrollmentService,
        private readonly walletService: WalletService
    ) { }



    @UseGuards(AuthGuard)
    @MessagePattern("enrollment.getUserEnrollments")
    async getUserEnrollments(
        @Ctx() context: IUserContext,
        @Payload(new RpcValidationPipe())
        payload: { options: PaginateOptionsWithSearch },
    ) {
        return await this.enrollmentService.getUserEnrollments(context.userPayload._id as string, payload.options)
    }



    @UseGuards(AuthGuard)
    @MessagePattern("enrollment.enrollToCourse")
    async creditWalletSubscription(
        @Payload(new RpcValidationPipe())
        initiateSubscriptionDto: InitiateSubscriptionDto,
        @Ctx() context: IUserContext,
    ) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const user = context.userPayload;
            const { subscriptionType, courseId } = initiateSubscriptionDto
            if (subscriptionType !== SubscriptionType.USER_COURSE) throw new Error("Only subscription type is allowed for wallet credit")
            const course = await this.courseService.findOne(courseId);
            if (!course) throw new NotFoundException("Course not found");
            if (!course.isPaid) throw new BadRequestException("Course is not paid");

            const priceUSD = course.isPaid ? course.pricing[initiateSubscriptionDto.billingCycle]?.priceUSD : 0;
            if (priceUSD === undefined) throw new BadRequestException("Course price for the selected billing cycle is not available");


            const subscription = {
                status: SubscriptionStatus.ACTIVE,
                starts_at: (new Date()).toISOString(),
                createdAt: (new Date()).toISOString(),
                updatedAt: (new Date()).toISOString(),
                billing: {
                    amount: priceUSD,
                    currency: Currency.USD,
                    billingCycle: initiateSubscriptionDto.billingCycle,
                    email: user.email,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    phone_number: user.phone,
                },
            };

            const enrollment = await this.enrollmentService.enrollUserToCourse(
                user._id as string,
                courseId,
                undefined,
                subscription
            );

            await this.walletService.debit({
                userId: user._id as string,
                transactionDto: {
                    amount: priceUSD,
                    currency: Currency.USD,
                },
                session
            });

            const populatedCourse = await course.populate<{ organization: Organization }>("organization");

            await this.walletService.credit({
                userId: populatedCourse.organization.superAdminId.toString(),
                transactionDto: {
                    amount: priceUSD,
                    currency: Currency.USD
                }, session
            },);


            await session.commitTransaction();
            session.endSession();

            return enrollment

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            handleRpcError(error)
        }
    }





}




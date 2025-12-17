import { Controller, UseGuards } from "@nestjs/common";
import { Ctx, MessagePattern, Payload } from "@nestjs/microservices";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { handleRpcError } from "src/utils/errorHandling";
import { RpcValidationPipe } from "src/utils/RpcValidationPipe";
import { IUserContext } from "src/utils/types/IUserContext.interface";
import { WalletService } from "./wallet.service";



@Controller("wallet")
export class WalletControllerMessage {
    constructor(
        private readonly walletService: WalletService
    ) { }

    @MessagePattern("wallet.getUserWallet")
    @UseGuards(AuthGuard)
    async organizationCreateUser(
        @Ctx() context: IUserContext
    ) {
        try {
            return await this.walletService.findByUserIdentifier(context.userPayload._id as string)

        } catch (error) {

            handleRpcError(error)
        }
    }
}


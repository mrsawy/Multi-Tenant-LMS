// src/file/file.controller.ts
import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    Param,
    Delete,
} from '@nestjs/common';
import { FileService } from './file.service';
import {
    GeneratePresignedUrlDto,
    PresignedUrlResponseDto,
    ValidateFileKeysDto,
} from './dto/file.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { Ctx, MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { IUserContext } from 'src/utils/types/IUserContext.interface';

@UseGuards(AuthGuard)
@Controller()
export class FileMessageController {
    constructor(private readonly fileService: FileService) { }

    @MessagePattern('file.getPreSignedUrl')
    async generatePresignedUrl(
        @Payload(new RpcValidationPipe())
        generatePresignedUrlDto: GeneratePresignedUrlDto,
        @Ctx() context: IUserContext,

    ): Promise<PresignedUrlResponseDto> {
        const user = context.userPayload

        return this.fileService.generatePresignedUrl({
            ...generatePresignedUrlDto,
            userUserName: user.username,
        });
    }

    // @Post('validate')
    // async validateFileKeys(@Body() validateFileKeysDto: ValidateFileKeysDto) {
    //   const isValid = await this.fileService.validateFileKeys(
    //     validateFileKeysDto.fileKeys,
    //   );
    //   return { valid: isValid };
    // }

    // @Get('download/*fileKey')
    // async getDownloadUrl(@Param('fileKey') fileKey: string) {
    //   const downloadUrl = await this.fileService.getFileUrl(fileKey);
    //   return { downloadUrl };
    // }

    // @Delete('*fileKey')
    // async deleteFile(@Param('fileKey') fileKey: string) {
    //   await this.fileService.deleteFile(fileKey);
    //   return { message: 'File deleted successfully' };
    // }
}
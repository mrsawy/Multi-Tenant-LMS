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

@Controller('file')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('presigned-url')
  async generatePresignedUrl(
    @Body() generatePresignedUrlDto: GeneratePresignedUrlDto,
    @Request() req: IUserRequest,
  ): Promise<PresignedUrlResponseDto> {
    return this.fileService.generatePresignedUrl({
      ...generatePresignedUrlDto,
      userUserName: req.user.username,
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
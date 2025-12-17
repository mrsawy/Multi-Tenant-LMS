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
} from './dto/file.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';

@UseGuards(AuthGuard)
@Controller('file')
export class FileHttpController {
  constructor(private readonly fileService: FileService) {}

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

  @Get('/file-url/:fileKey')
  async getFileUrl(@Param('fileKey') fileKey: string) {
    return await this.fileService.getFileUrl(fileKey);
  }
}

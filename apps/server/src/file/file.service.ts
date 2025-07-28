// src/file/file.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import {
  GeneratePresignedUrlDto,
  PresignedUrlResponseDto,
  ValidateFileKeysDto
} from './dto/file.dto';

@Injectable()
export class FileService {
  private s3: S3;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async generatePresignedUrl(
    generatePresignedUrlDto: GeneratePresignedUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    const { fileType, fileSize, category, userUserName } = generatePresignedUrlDto;

    // Validate file type and size
    this.validateFile(fileType, fileSize);

    // Generate unique file key with user context
    const fileExtension = this.getFileExtension(fileType);
    const fileKey = `${category}/${userUserName}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Key: fileKey,
      Expires: 3600, // 1 hour
      ContentType: fileType,
      // ContentLength: fileSize,
    };

    try {
      const uploadUrl = await this.s3.getSignedUrlPromise('putObject', params);

      return {
        uploadUrl,
        fileKey,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };
    } catch (error) {
      throw new BadRequestException('Failed to generate upload URL', error.message);
    }
  }

  async validateFileKeys(fileKeys: string[]): Promise<boolean> {
    if (!fileKeys?.length) return true;

    const validationPromises = fileKeys.map(async (fileKey) => {
      try {
        console.log("validating urlKey :", fileKey)
        const result = await this.s3
          .headObject({
            Bucket: this.configService.get('S3_BUCKET_NAME') as string,
            Key: fileKey,
          })
          .promise();

        console.log("validation result :", result)
        return true;
      } catch (error) {
        return false;
      }
    });

    const results = await Promise.all(validationPromises);
    return results.every(Boolean);
  }

  async getFileUrl(fileKey: string): Promise<string> {
    const params = {
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Key: fileKey,
      Expires: 3600, // 1 hour for download
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async deleteFile(fileKey: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.configService.get('S3_BUCKET_NAME') as string,
        Key: fileKey,
      })
      .promise();
  }

  async deleteFiles(fileKeys: string[]): Promise<void> {
    if (!fileKeys?.length) return;

    const deleteParams = {
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Delete: {
        Objects: fileKeys.map((Key) => ({ Key })),
      },
    };

    await this.s3.deleteObjects(deleteParams).promise();
  }

  private validateFile(fileType: string, fileSize: number): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'video/mkv',
      'application/zip',
    ];

    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestException('File type not allowed');
    }

    const maxSize = 150 * 1024 * 1024; // 150MB
    if (fileSize > maxSize) {
      throw new BadRequestException('File size exceeds maximum limit');
    }
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExtension = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'video/mp4': 'mp4',
      'application/zip': 'zip',
    };

    return mimeToExtension[mimeType] || 'bin';
  }

  getMimeType(fileName: string) {
    return fileName.split(".")[1]
  }






  /**
    * Upload a file directly to S3 (server-side upload)
    */
  async uploadToS3(file: Express.Multer.File, path: string) {
    const { buffer, originalname, mimetype } = file;

    // Validate file
    this.validateFile(mimetype, buffer.length);

    // Generate unique file key
    const fileName = originalname ? this.sanitizeFileName(originalname) : `file_${Date.now()}`;
    const fileKey = `${path}/${uuidv4()}_${fileName}`;

    const uploadParams = {
      Bucket: this.configService.get('S3_BUCKET_NAME') as string,
      Key: fileKey,
      Body: buffer,
      ContentType: mimetype,
      ContentDisposition: `inline; filename="${originalname}"`,
      Metadata: {
        originalName: originalname || 'unknown',
        uploadedAt: new Date().toISOString(),
      },
    };

    try {
      console.log(`Uploading file to S3: ${fileKey}`);
      const result = await this.s3.upload(uploadParams).promise();

      console.log(`File uploaded successfully: ${result.Location}`);

      return {
        fileKey,
        url: result.Location,
        size: buffer.length,
        originalname,
        mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new BadRequestException(`Failed to upload file to S3: ${error.message}`);
    }
  }

  // /**
  //  * Upload multiple files to S3
  //  */
  // async uploadMultipleToS3(uploadFileDtos: UploadFileDto[]): Promise<UploadFileResponseDto[]> {
  //   const uploadPromises = uploadFileDtos.map(dto => this.uploadToS3(dto));
  //   return Promise.all(uploadPromises);
  // }


  async fileExists(fileKey: string): Promise<boolean> {
    try {
      await this.s3
        .headObject({
          Bucket: this.configService.get('S3_BUCKET_NAME') as string,
          Key: fileKey,
        })
        .promise();
      return true;
    } catch (error) {
      return false;
    }
  }



  private sanitizeFileName(fileName: string): string {
    // Remove special characters and replace spaces with underscores
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  }




}
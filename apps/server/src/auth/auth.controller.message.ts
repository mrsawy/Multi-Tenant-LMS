import {
  Controller,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@Controller()
export class AuthControllerMessage {
  constructor(private authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(
    @Payload(new RpcValidationPipe())
    registerDto: RegisterDto,
  ) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      // Convert NestJS exceptions to RpcException for microservice context
      if (error instanceof ConflictException) {
        throw new RpcException({
          message: error.message,
          code: 409,
          error: 'Conflict',
        });
      }
      throw new RpcException({
        message: error.message || 'An unexpected error occurred',
        code: 500,
        error: 'Internal Server Error',
      });
    }
  }

  @MessagePattern('auth.login')
  async login(
    @Payload(new RpcValidationPipe())
    loginDto: LoginDto,
  ) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      // Convert NestJS exceptions to RpcException for microservice context
      if (error instanceof UnauthorizedException) {
        throw new RpcException({
          message: error.message,
          status: 401,
          error: 'Unauthorized',
        });
      }

      throw new RpcException({
        message: error.message || 'An unexpected error occurred',
        status: 500,
        error: 'Internal Server Error',
      });
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
// import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    // private readonly userService: UserService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() === 'http') {
      return await this.handleHttpRequest(context);
    } else if (context.getType() === 'rpc') {
      return await this.handleRpcRequest(context);
      /* c8 ignore start */
    } else {
      throw new InternalServerErrorException(
        'unimplemented communication context',
      );
    }
    /* c8 ignore end */
  }

  private async handleHttpRequest(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.authService.verifyToken(token);
      request.user = payload;
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid token ::=>', error.message);
    }
  }
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async handleRpcRequest(context: ExecutionContext): Promise<boolean> {
    const data: { authorization: string } = context.switchToRpc().getData();
    const rpcContext: { userPayload: User } = context
      .switchToRpc()
      .getContext();
    try {
      if (!data.authorization || data.authorization.trim() === '') {
        throw new RpcException('please provide token');
      }
      const user = await this.authService.verifyToken(data.authorization);
      rpcContext.userPayload = user!;
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'session expired! Please sign In';

      throw new RpcException("auth-failed-" + errorMessage);
    }
  }
}

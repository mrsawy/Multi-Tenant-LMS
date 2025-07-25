import {
    CanActivate,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
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

    private async handleHttpRequest(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = this.authService.verifyToken(token);
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

    private async handleRpcRequest(
        context: ExecutionContext,
    ): Promise<boolean> {
        const ctx = context.switchToRpc();
        const data = ctx.getData();
        const metadata = ctx.getContext();

        // Option 1: Token in metadata (e.g. gRPC or custom microservice clients)
        const token =
            metadata?.get?.('Authorization')?.split?.(' ')[1] ||
            metadata?.authorization?.split?.(' ')[1] ||
            data?.authorization?.split?.(' ')[1];

        if (!token) {
            throw new RpcException('No token provided in RPC request');
        }

        try {
            const payload = this.authService.verifyToken(token);

            // Attach user to data context or metadata for further processing
            if (data) data.user = payload;
            if (metadata) metadata.user = payload;

            return true;
        } catch (error) {
            throw new RpcException('Invalid token in RPC request');
        }
    }

}

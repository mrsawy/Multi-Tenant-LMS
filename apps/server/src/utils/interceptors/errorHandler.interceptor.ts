import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleRpcError } from '../errorHandling';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
    constructor() {
        console.log('🟢 ErrorHandlerInterceptor instantiated');
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const contextType = context.getType();
        console.log('🟡 Interceptor called - Context:', contextType);

        return next.handle().pipe(
            catchError((error) => {
                console.log('🔴 Interceptor caught error:', error);

                if (contextType === 'rpc') {
                    // handleRpcError throws an RpcException
                    try {
                        handleRpcError(error);
                    } catch (rpcException) {
                        console.log('🔴 Throwing formatted RpcException');
                        return throwError(() => rpcException);
                    }
                }

                // For other contexts, re-throw
                return throwError(() => error);
            }),
        );
    }
}


import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { throwError } from 'rxjs';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType();

    if (contextType === 'http') {
      return this.handleHttpException(exception, host);
    } else if (contextType === 'rpc') {
      return this.handleRpcException(exception, host);
    }
  }

  private handleHttpException(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof RpcException) {
      // Handle RPC exceptions in HTTP context
      const rpcError = exception.getError();
      if (typeof rpcError === 'string') {
        message = rpcError;
      } else if (rpcError && typeof rpcError === 'object') {
        message = (rpcError as any).message || JSON.stringify(rpcError);
      } else {
        message = String(rpcError);
      }
      status = HttpStatus.BAD_GATEWAY;
    } else {
      // Handle unexpected errors
      message = exception.message || message;
    }

    // Log the error
    console.error('HTTP Error:', {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      stack: exception.stack,
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }

  private handleRpcException(exception: any, host: ArgumentsHost) {
    let error = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'RpcError',
    };

    if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      if (typeof rpcError === 'object') {
        error = { ...error, ...rpcError };
      } else {
        error.message = rpcError;
      }
    } else if (exception instanceof HttpException) {
      error.statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        error.message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        error = { ...error, ...(exceptionResponse as any) };
      }
    } else {
      error.message = exception.message || error.message;
    }

    // Log the error
    console.error('RPC Error:', {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: exception.stack,
    });

    // Return error as observable for NATS
    return throwError(() => error);
  }
}

// validate-then-continue.interceptor.ts - BETTER APPROACH
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidateThenContinueInterceptor implements NestInterceptor {
    constructor(private readonly dtoClass: any) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // For form-data, validation happens after multer processes the request
        // So we validate in the response pipeline instead
        return next.handle().pipe(
            tap(async () => {
                // This runs after all other interceptors (including file upload)
                await this.validateRequest(request);
            })
        );
    }

    private async validateRequest(request: any) {
        const contentType = request.headers['content-type'] || '';
        let bodyToValidate = {};

        if (contentType.includes('application/json')) {
            bodyToValidate = request.body || {};
        } else if (contentType.includes('multipart/form-data')) {
            // After multer processes, form fields are in request.body
            bodyToValidate = {};
            if (request.body && typeof request.body === 'object') {
                for (const [key, value] of Object.entries(request.body)) {
                    if (key !== 'file' && key !== 'files') {
                        bodyToValidate[key] = Array.isArray(value) ? value[0] : value;
                    }
                }
            }
        } else {
            bodyToValidate = request.body || {};
        }

        const dto = plainToClass(this.dtoClass, bodyToValidate);
        const errors = await validate(dto as object);

        if (errors.length > 0) {
            const errorMessages = errors.map(error =>
                Object.values(error.constraints || {}).join(', ')
            ).join('; ');
            throw new BadRequestException(`Validation failed: ${errorMessages}`);
        }

        request.validatedBody = dto;
    }
}

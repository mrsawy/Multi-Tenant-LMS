import { Request } from 'express';
import { UserDocument } from 'src/user/entities/user.entity';

export interface IUserRequest extends Request {
    user: UserDocument;
}

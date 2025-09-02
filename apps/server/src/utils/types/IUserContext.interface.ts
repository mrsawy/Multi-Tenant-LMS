import { NatsContext } from '@nestjs/microservices';
import { UserDocument } from 'src/user/entities/user.entity';

export interface IUserContext extends NatsContext {
  userPayload: UserDocument;
}

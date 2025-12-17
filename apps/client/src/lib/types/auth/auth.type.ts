import { IUser } from "../user/user.interface";

export interface RegisterResponse {
    access_token: string;
    user: IUser;
}

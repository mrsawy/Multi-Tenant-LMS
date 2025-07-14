import { isEmail } from "class-validator"


export class LoginDto {
    @isEmail()
    username: string;

    password: string;
}

import { IsString } from "class-validator";

export class CreateUserDTO {
    @IsString()
    readonly login: string;

    @IsString()
    readonly name: string;

    @IsString()
    readonly password: string;
}
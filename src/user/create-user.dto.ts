import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserDTO {
    @ApiProperty({ description: "User login", required: true})
    @IsString()
    readonly login: string;
    @ApiProperty({ description: "User name", required: true})
    @IsString()
    readonly name: string;
    @ApiProperty({ description: "User password", required: true})
    @IsString()
    readonly password: string;
}
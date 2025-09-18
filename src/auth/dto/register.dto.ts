import { IsString } from "class-validator";

export class RegisterDto {
  @IsString()
  readonly login: string;
  @IsString()
  readonly name: string;
  @IsString()
  readonly password: string;
}
 
export default RegisterDto;
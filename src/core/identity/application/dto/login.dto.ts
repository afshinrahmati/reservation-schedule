import { ApiPropertyOptional } from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class LoginDto {
    @ApiPropertyOptional({
        description: 'number',
        default: "BLU@gmail.com"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @ApiPropertyOptional({
        description: 'number',
        default: "1qaz!QAZ"
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
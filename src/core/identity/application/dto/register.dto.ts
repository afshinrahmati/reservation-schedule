import { ApiPropertyOptional } from "@nestjs/swagger";
import {IsEmail, IsEnum, IsNotEmpty, IsString} from "class-validator";

export class RegisterDto {
    @ApiPropertyOptional({
        description: 'string',
        default: "BLU@gmail.com"
    })
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;
    @ApiPropertyOptional({
        description: 'string',
        default: "1qaz!QAZ"
    })
    @IsNotEmpty()
    @IsString()
    password: string;
    @ApiPropertyOptional({
        description: 'string',
        default: "afshinRahmati"
    })
    @IsNotEmpty()
    @IsString()
    fullName: string;
        @ApiPropertyOptional({
        description: '[HOST,GUEST]',
        default: "HOST"
    })
    @IsNotEmpty()
    @IsEnum(["HOST","GUEST"])
    role: 'HOST' | 'GUEST';
}

import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsInt()
  @IsOptional()
  phone: number;
}

import { IsEmail, IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsOptional()
  @IsInt()
  phone: number;
}

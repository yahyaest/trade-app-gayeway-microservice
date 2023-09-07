import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
  @IsEmail()
  username: string;

  @IsString()
  @IsOptional()
  filename: string;

  @IsInt()
  @IsOptional()
  userId: number;
}

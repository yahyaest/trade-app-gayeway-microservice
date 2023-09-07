import { IsEmail, IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @IsEmail()
  username: string;

  @IsOptional()
  @IsString()
  filename: string;


  @IsOptional()
  @IsInt()
  userId: number;
}

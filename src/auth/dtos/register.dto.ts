import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum Role {
  ADMIN = 'admin',
  USER = 'user',
  SELLER = 'seller',
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The password of the user',
    example: '12345678',
    minLength: 8,
    maxLength: 32,
    format: 'password',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The role of the user',
    example: 'admin',
    enum: Role,
    required: false,
  })
  role?: Role.USER;
}

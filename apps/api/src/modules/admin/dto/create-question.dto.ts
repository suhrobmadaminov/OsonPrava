import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  textUz: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  textCyr: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  textRu: string;

  @ApiProperty()
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  textUz: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  textCyr: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  textRu: string;

  @ApiProperty()
  @IsInt()
  ticketId: number;

  @ApiProperty()
  @IsInt()
  topicId: number;

  @ApiProperty({ type: [CreateAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AssistantRequestDto {
  @IsString()
  @MaxLength(4000)
  query: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  conversationId?: string;
}


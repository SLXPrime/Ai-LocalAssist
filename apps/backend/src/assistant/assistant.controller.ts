import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssistantService } from './assistant.service';
import { AssistantRequestDto } from './dto/assistant-request.dto';
import { AssistantResponseDto } from './dto/assistant-response.dto';

@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async handle(
    @Body() body: AssistantRequestDto,
    @Headers('x-api-key') apiKey?: string,
  ): Promise<AssistantResponseDto> {
    const configuredKey = this.configService.get<string>('app.apiKey');
    if (configuredKey && apiKey !== configuredKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.assistantService.ask(body);
  }
}


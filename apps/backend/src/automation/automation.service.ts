import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  @OnEvent('assistant.query.received')
  handleAssistantQuery(event: { conversationId: string; query: string }): void {
    this.logger.debug(`Automation event received for ${event.conversationId}: ${event.query}`);
  }
}


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { OpenaiService } from '../openai/openai.service';

export interface CreateChatDto {
  title?: string;
}

export interface SendMessageDto {
  content: string;
  sessionId: string;
}

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
  ) {}

  async createSession(userId: string, createChatDto: CreateChatDto) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        title: createChatDto.title || 'New Chat Session',
      },
    });
  }

  async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
    const { content, sessionId } = sendMessageDto;

    // Verify session belongs to user
    const session = await this.prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Save user message
    await this.prisma.chatMessage.create({
      data: {
        sessionId,
        content,
        role: 'USER',
      },
    });

    // Get AI response
    const aiResponse = await this.openaiService.generateGeotechnicalResponse(content);

    // Save AI response
    const aiMessage = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        content: aiResponse,
        role: 'ASSISTANT',
      },
    });

    return aiMessage;
  }

  async getSessionMessages(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session.messages;
  }

  async getUserSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
} 
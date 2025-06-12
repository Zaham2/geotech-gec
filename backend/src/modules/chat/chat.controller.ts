import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService, CreateChatDto, SendMessageDto } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({ status: 201, description: 'Chat session created successfully' })
  async createSession(@Request() req, @Body() createChatDto: CreateChatDto) {
    return this.chatService.createSession(req.user.id, createChatDto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all user chat sessions' })
  @ApiResponse({ status: 200, description: 'Chat sessions retrieved successfully' })
  async getUserSessions(@Request() req) {
    return this.chatService.getUserSessions(req.user.id);
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get messages from a chat session' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionMessages(@Param('sessionId') sessionId: string, @Request() req) {
    return this.chatService.getSessionMessages(req.user.id, sessionId);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message and get AI response' })
  @ApiResponse({ status: 201, description: 'Message sent and AI response received' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, sendMessageDto);
  }
}

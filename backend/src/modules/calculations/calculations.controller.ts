import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  CalculationsService,
  CreateCalculationDto,
  UpdateCalculationDto,
} from './calculations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('calculations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create and run a new calculation' })
  @ApiResponse({ status: 201, description: 'Calculation started successfully' })
  async create(@Request() req, @Body() createCalculationDto: CreateCalculationDto) {
    return await this.calculationsService.create(req.user.id, createCalculationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user calculations' })
  @ApiResponse({ status: 200, description: 'Calculations retrieved successfully' })
  async findAll(@Request() req) {
    return await this.calculationsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calculation by ID' })
  @ApiResponse({ status: 200, description: 'Calculation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Calculation not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.calculationsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update calculation' })
  @ApiResponse({ status: 200, description: 'Calculation updated successfully' })
  @ApiResponse({ status: 404, description: 'Calculation not found' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCalculationDto: UpdateCalculationDto,
  ) {
    return await this.calculationsService.update(id, req.user.id, updateCalculationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete calculation' })
  @ApiResponse({ status: 200, description: 'Calculation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Calculation not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return await this.calculationsService.remove(id, req.user.id);
  }
} 
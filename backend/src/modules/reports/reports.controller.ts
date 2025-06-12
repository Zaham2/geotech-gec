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
  ReportsService,
  CreateReportDto,
  UpdateReportDto,
} from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({ status: 201, description: 'Report generated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(@Request() req, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(req.user.id, createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async findAll(@Request() req) {
    return this.reportsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.reportsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, req.user.id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.reportsService.remove(id, req.user.id);
  }

  @Post(':id/regenerate')
  @ApiOperation({ summary: 'Regenerate report with updated data' })
  @ApiResponse({ status: 200, description: 'Report regenerated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async regenerate(@Param('id') id: string, @Request() req) {
    return this.reportsService.regenerateReport(id, req.user.id);
  }
} 
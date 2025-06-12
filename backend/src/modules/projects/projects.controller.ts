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
  ProjectsService,
  CreateProjectDto,
  UpdateProjectDto,
  CreateSoilSampleDto,
} from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, req.user.id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/soil-samples')
  @ApiOperation({ summary: 'Add soil sample to project' })
  @ApiResponse({ status: 201, description: 'Soil sample added successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async addSoilSample(
    @Param('id') projectId: string,
    @Request() req,
    @Body() createSoilSampleDto: CreateSoilSampleDto,
  ) {
    return this.projectsService.addSoilSample(
      projectId,
      req.user.id,
      createSoilSampleDto,
    );
  }

  @Get(':id/soil-samples')
  @ApiOperation({ summary: 'Get project soil samples' })
  @ApiResponse({ status: 200, description: 'Soil samples retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getSoilSamples(@Param('id') projectId: string, @Request() req) {
    return this.projectsService.getSoilSamples(projectId, req.user.id);
  }

  @Get(':id/calculations')
  @ApiOperation({ summary: 'Get project calculations' })
  @ApiResponse({ status: 200, description: 'Calculations retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getCalculations(@Param('id') projectId: string, @Request() req) {
    return this.projectsService.getProjectCalculations(projectId, req.user.id);
  }

  @Get(':id/reports')
  @ApiOperation({ summary: 'Get project reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getReports(@Param('id') projectId: string, @Request() req) {
    return this.projectsService.getProjectReports(projectId, req.user.id);
  }
} 
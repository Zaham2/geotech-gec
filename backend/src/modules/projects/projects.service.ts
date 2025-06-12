import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { Project, ProjectStatus } from '@prisma/client';

export interface CreateProjectDto {
  name: string;
  description?: string;
  location?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  location?: string;
  status?: ProjectStatus;
}

export interface CreateSoilSampleDto {
  sampleId: string;
  depth: number;
  soilType: string;
  moistureContent?: number;
  density?: number;
  liquidLimit?: number;
  plasticLimit?: number;
  plasticityIndex?: number;
  grainSize?: any;
  strength?: any;
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        soilSamples: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        calculations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        reports: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        soilSamples: {
          orderBy: { depth: 'asc' },
        },
        calculations: {
          orderBy: { createdAt: 'desc' },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    // Verify ownership
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    // Verify ownership
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.prisma.project.delete({
      where: { id },
    });
  }

  async addSoilSample(projectId: string, userId: string, createSoilSampleDto: CreateSoilSampleDto) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.soilSample.create({
      data: {
        ...createSoilSampleDto,
        projectId,
      },
    });
  }

  async getSoilSamples(projectId: string, userId: string) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.soilSample.findMany({
      where: { projectId },
      orderBy: { depth: 'asc' },
    });
  }

  async getProjectCalculations(projectId: string, userId: string) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.calculation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProjectReports(projectId: string, userId: string) {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.report.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
} 
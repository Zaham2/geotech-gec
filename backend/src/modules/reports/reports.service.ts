import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { OpenaiService } from '../openai/openai.service';
import { Report, ReportType } from '@prisma/client';

export interface CreateReportDto {
  title: string;
  type: ReportType;
  projectId: string;
  isPublic?: boolean;
}

export interface UpdateReportDto {
  title?: string;
  content?: string;
  isPublic?: boolean;
}

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
  ) {}

  async create(userId: string, createReportDto: CreateReportDto): Promise<Report> {
    // Verify project ownership
    const project = await this.prisma.project.findFirst({
      where: {
        id: createReportDto.projectId,
        userId,
      },
      include: {
        soilSamples: true,
        calculations: {
          where: { status: 'COMPLETED' },
          include: {
            project: true,
            soilSample: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Generate initial report content
    const content = await this.generateReportContent(project, createReportDto.type);

    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        content,
        generatedBy: 'AI',
      },
    });

    return report;
  }

  async findAll(userId: string): Promise<Report[]> {
    return this.prisma.report.findMany({
      where: {
        OR: [
          { project: { userId } },
          { isPublic: true },
        ],
      },
      include: {
        project: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Report> {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        OR: [
          { project: { userId } },
          { isPublic: true },
        ],
      },
      include: {
        project: true,
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async update(id: string, userId: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        project: { userId },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return this.prisma.report.update({
      where: { id },
      data: updateReportDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        project: { userId },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    await this.prisma.report.delete({
      where: { id },
    });
  }

  async regenerateReport(id: string, userId: string): Promise<Report> {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        project: { userId },
      },
      include: {
        project: {
          include: {
            soilSamples: true,
            calculations: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    const newContent = await this.generateReportContent(report.project, report.type);

    return this.prisma.report.update({
      where: { id },
      data: {
        content: newContent,
        updatedAt: new Date(),
      },
    });
  }

  private async generateReportContent(project: any, reportType: ReportType): Promise<string> {
    const projectData = {
      name: project.name,
      description: project.description,
      location: project.location,
      soilSamples: project.soilSamples?.length || 0,
      calculations: project.calculations?.length || 0,
    };

    const analysisResults = {
      soilSamples: project.soilSamples || [],
      calculations: project.calculations || [],
    };

    switch (reportType) {
      case 'SOIL_INVESTIGATION':
        return this.generateSoilInvestigationReport(projectData, analysisResults);

      case 'FOUNDATION_DESIGN':
        return this.generateFoundationDesignReport(projectData, analysisResults);

      case 'SLOPE_ANALYSIS':
        return this.generateSlopeAnalysisReport(projectData, analysisResults);

      case 'GEOTECHNICAL_SUMMARY':
        return this.generateGeotechnicalSummaryReport(projectData, analysisResults);

      default:
        return this.openaiService.generateReport(projectData, analysisResults);
    }
  }

  private async generateSoilInvestigationReport(projectData: any, analysisResults: any): Promise<string> {
    const prompt = `Generate a comprehensive soil investigation report for:
    Project: ${projectData.name}
    Location: ${projectData.location}
    
    Include analysis of ${analysisResults.soilSamples.length} soil samples and provide:
    1. Executive Summary
    2. Site Description and Geology
    3. Field Investigation Program
    4. Laboratory Testing Results
    5. Soil Classification and Properties
    6. Recommendations for Design Parameters
    7. Limitations and Assumptions`;

    return this.openaiService.generateGeotechnicalResponse(prompt, { projectData, analysisResults });
  }

  private async generateFoundationDesignReport(projectData: any, analysisResults: any): Promise<string> {
    const prompt = `Generate a foundation design report for:
    Project: ${projectData.name}
    Location: ${projectData.location}
    
    Based on ${analysisResults.calculations.length} calculations, provide:
    1. Executive Summary
    2. Site Conditions
    3. Design Criteria and Loading
    4. Foundation Analysis and Design
    5. Bearing Capacity Assessment
    6. Settlement Analysis
    7. Design Recommendations
    8. Construction Considerations`;

    return this.openaiService.generateGeotechnicalResponse(prompt, { projectData, analysisResults });
  }

  private async generateSlopeAnalysisReport(projectData: any, analysisResults: any): Promise<string> {
    const prompt = `Generate a slope stability analysis report for:
    Project: ${projectData.name}
    Location: ${projectData.location}
    
    Include:
    1. Executive Summary
    2. Site Description and Geology
    3. Slope Geometry and Material Properties
    4. Stability Analysis Methods
    5. Factor of Safety Calculations
    6. Mitigation Recommendations
    7. Monitoring Recommendations
    8. Limitations`;

    return this.openaiService.generateGeotechnicalResponse(prompt, { projectData, analysisResults });
  }

  private async generateGeotechnicalSummaryReport(projectData: any, analysisResults: any): Promise<string> {
    const prompt = `Generate a comprehensive geotechnical summary report for:
    Project: ${projectData.name}
    Location: ${projectData.location}
    
    Summarize all findings including:
    1. Project Overview
    2. Site Investigation Summary
    3. Soil Conditions and Properties
    4. Engineering Analysis Results
    5. Design Recommendations
    6. Construction Considerations
    7. Risk Assessment
    8. Conclusions and Recommendations`;

    return this.openaiService.generateGeotechnicalResponse(prompt, { projectData, analysisResults });
  }
} 
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { OpenaiService } from '../openai/openai.service';
import { Calculation, CalculationType, CalculationStatus } from '@prisma/client';

export interface CreateCalculationDto {
  type: CalculationType;
  input: any;
  projectId?: string;
  soilSampleId?: string;
}

export interface UpdateCalculationDto {
  input?: any;
  output?: any;
  status?: CalculationStatus;
  aiResponse?: string;
}

@Injectable()
export class CalculationsService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
  ) {}

  async create(userId: string, createCalculationDto: CreateCalculationDto): Promise<Calculation> {
    const calculation = await this.prisma.calculation.create({
      data: {
        ...createCalculationDto,
        userId,
        output: {},
        status: 'PENDING',
      },
    });

    // Process calculation asynchronously
    this.processCalculation(calculation.id).catch(console.error);

    return calculation;
  }

  async findAll(userId: string): Promise<Calculation[]> {
    return this.prisma.calculation.findMany({
      where: { userId },
      include: {
        project: {
          select: { id: true, name: true },
        },
        soilSample: {
          select: { id: true, sampleId: true, soilType: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Calculation> {
    const calculation = await this.prisma.calculation.findFirst({
      where: { id, userId },
      include: {
        project: true,
        soilSample: true,
      },
    });

    if (!calculation) {
      throw new NotFoundException(`Calculation with ID ${id} not found`);
    }

    return calculation;
  }

  async update(id: string, userId: string, updateCalculationDto: UpdateCalculationDto): Promise<Calculation> {
    const calculation = await this.prisma.calculation.findFirst({
      where: { id, userId },
    });

    if (!calculation) {
      throw new NotFoundException(`Calculation with ID ${id} not found`);
    }

    return this.prisma.calculation.update({
      where: { id },
      data: updateCalculationDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const calculation = await this.prisma.calculation.findFirst({
      where: { id, userId },
    });

    if (!calculation) {
      throw new NotFoundException(`Calculation with ID ${id} not found`);
    }

    await this.prisma.calculation.delete({
      where: { id },
    });
  }

  private async processCalculation(calculationId: string) {
    try {
      await this.prisma.calculation.update({
        where: { id: calculationId },
        data: { status: 'PROCESSING' },
      });

      const calculation = await this.prisma.calculation.findUnique({
        where: { id: calculationId },
        include: {
          project: true,
          soilSample: true,
        },
      });

      if (!calculation) return;

      let result: any = {};
      let aiResponse = '';

      switch (calculation.type) {
        case 'BEARING_CAPACITY':
          result = await this.calculateBearingCapacity(calculation.input);
          aiResponse = await this.openaiService.generateCalculationGuidance(
            'bearing capacity',
            calculation.input,
          );
          break;

        case 'SETTLEMENT':
          result = await this.calculateSettlement(calculation.input);
          aiResponse = await this.openaiService.generateCalculationGuidance(
            'settlement',
            calculation.input,
          );
          break;

        case 'SLOPE_STABILITY':
          result = await this.calculateSlopeStability(calculation.input);
          aiResponse = await this.openaiService.generateCalculationGuidance(
            'slope stability',
            calculation.input,
          );
          break;

        case 'LATERAL_PRESSURE':
          result = await this.calculateLateralPressure(calculation.input);
          aiResponse = await this.openaiService.generateCalculationGuidance(
            'lateral pressure',
            calculation.input,
          );
          break;

        default:
          result = { message: 'Calculation type not implemented yet' };
          aiResponse = await this.openaiService.generateCalculationGuidance(
            calculation.type,
            calculation.input,
          );
      }

      await this.prisma.calculation.update({
        where: { id: calculationId },
        data: {
          output: result,
          aiResponse,
          status: 'COMPLETED',
        },
      });
    } catch (error) {
      console.error('Calculation processing error:', error);
      await this.prisma.calculation.update({
        where: { id: calculationId },
        data: {
          status: 'FAILED',
          output: { error: 'Calculation failed' },
        },
      });
    }
  }

  private async calculateBearingCapacity(input: any) {
    // Simple bearing capacity calculation using Terzaghi's formula
    const { cohesion = 0, frictionAngle = 30, unitWeight = 18, depth = 1, width = 1 } = input;

    // Bearing capacity factors (simplified)
    const phi = (frictionAngle * Math.PI) / 180;
    const Nq = Math.exp(Math.PI * Math.tan(phi)) * Math.tan(Math.PI / 4 + phi / 2) ** 2;
    const Nc = (Nq - 1) / Math.tan(phi);
    const Ng = 2 * (Nq - 1) * Math.tan(phi);

    // Shape factors (simplified for strip footing)
    const sc = 1.0;
    const sq = 1.0;
    const sg = 1.0;

    // Ultimate bearing capacity
    const qu = cohesion * Nc * sc + unitWeight * depth * Nq * sq + 0.5 * unitWeight * width * Ng * sg;

    // Allowable bearing capacity (factor of safety = 3)
    const qa = qu / 3;

    return {
      ultimateBearingCapacity: Math.round(qu * 100) / 100,
      allowableBearingCapacity: Math.round(qa * 100) / 100,
      factorOfSafety: 3,
      bearingCapacityFactors: {
        Nc: Math.round(Nc * 100) / 100,
        Nq: Math.round(Nq * 100) / 100,
        Ng: Math.round(Ng * 100) / 100,
      },
      unit: 'kPa',
    };
  }

  private async calculateSettlement(input: any) {
    // Simple settlement calculation
    const { load = 100, area = 1, elasticModulus = 20000, poissonRatio = 0.3 } = input;

    const stress = load / area;
    const settlement = (stress * 1000 * (1 - poissonRatio ** 2)) / elasticModulus;

    return {
      appliedStress: Math.round(stress * 100) / 100,
      estimatedSettlement: Math.round(settlement * 100) / 100,
      unit: 'mm',
    };
  }

  private async calculateSlopeStability(input: any) {
    // Simple slope stability analysis (infinite slope method)
    const { slopeAngle = 30, cohesion = 10, frictionAngle = 25, unitWeight = 18, height = 5 } = input;

    const beta = (slopeAngle * Math.PI) / 180;
    const phi = (frictionAngle * Math.PI) / 180;

    // Factor of safety for infinite slope
    const fs = (cohesion / (unitWeight * height * Math.sin(beta) * Math.cos(beta))) + 
               (Math.tan(phi) / Math.tan(beta));

    let stability = 'Stable';
    if (fs < 1.0) stability = 'Unstable';
    else if (fs < 1.5) stability = 'Marginally Stable';

    return {
      factorOfSafety: Math.round(fs * 100) / 100,
      stability,
      recommendation: fs < 1.5 ? 'Slope reinforcement recommended' : 'Slope is stable',
    };
  }

  private async calculateLateralPressure(input: any) {
    // Active and passive earth pressure calculation (Rankine theory)
    const { unitWeight = 18, height = 3, frictionAngle = 30, cohesion = 0 } = input;

    const phi = (frictionAngle * Math.PI) / 180;
    const Ka = Math.tan(Math.PI / 4 - phi / 2) ** 2;
    const Kp = Math.tan(Math.PI / 4 + phi / 2) ** 2;

    const activeForce = 0.5 * Ka * unitWeight * height ** 2 - 2 * cohesion * height * Math.sqrt(Ka);
    const passiveForce = 0.5 * Kp * unitWeight * height ** 2 + 2 * cohesion * height * Math.sqrt(Kp);

    return {
      activeEarthPressureCoefficient: Math.round(Ka * 1000) / 1000,
      passiveEarthPressureCoefficient: Math.round(Kp * 1000) / 1000,
      activeForce: Math.round(Math.max(0, activeForce) * 100) / 100,
      passiveForce: Math.round(passiveForce * 100) / 100,
      unit: 'kN/m',
    };
  }
} 
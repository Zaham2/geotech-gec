import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { User, UserRole } from '@prisma/client';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateUserDto {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        calculations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        soilSamples: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getUserStats(userId: string) {
    const [projectCount, calculationCount, chatSessionCount] = await Promise.all([
      this.prisma.project.count({ where: { userId } }),
      this.prisma.calculation.count({ where: { userId } }),
      this.prisma.chatSession.count({ where: { userId } }),
    ]);

    return {
      projects: projectCount,
      calculations: calculationCount,
      chatSessions: chatSessionCount,
    };
  }
}

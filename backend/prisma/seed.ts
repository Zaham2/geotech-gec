import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@babatech.com' },
    update: {},
    create: {
      email: 'admin@babatech.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample engineer user
  const engineerPassword = await bcrypt.hash('engineer123', 12);
  
  const engineerUser = await prisma.user.upsert({
    where: { email: 'engineer@babatech.com' },
    update: {},
    create: {
      email: 'engineer@babatech.com',
      username: 'engineer',
      firstName: 'John',
      lastName: 'Smith',
      password: engineerPassword,
      role: 'ENGINEER',
    },
  });

  console.log('✅ Engineer user created:', engineerUser.email);

  // Create sample project
  const sampleProject = await prisma.project.create({
    data: {
      name: 'Highway Bridge Foundation',
      description: 'Geotechnical analysis for new highway bridge foundation',
      location: 'Highway 401, Ontario, Canada',
      status: 'ACTIVE',
      userId: engineerUser.id,
    },
  });

  console.log('✅ Sample project created:', sampleProject.name);

  // Create sample soil samples
  await prisma.soilSample.createMany({
    data: [
      {
        sampleId: 'BH-01-1.5',
        depth: 1.5,
        soilType: 'Sandy Clay',
        moistureContent: 18.5,
        density: 1850,
        liquidLimit: 35,
        plasticLimit: 18,
        plasticityIndex: 17,
        projectId: sampleProject.id,
        grainSize: {
          gravel: 5,
          sand: 45,
          silt: 30,
          clay: 20,
        },
        strength: {
          cohesion: 25,
          frictionAngle: 28,
        },
      },
      {
        sampleId: 'BH-01-3.0',
        depth: 3.0,
        soilType: 'Silty Sand',
        moistureContent: 12.3,
        density: 1920,
        liquidLimit: null,
        plasticLimit: null,
        plasticityIndex: null,
        projectId: sampleProject.id,
        grainSize: {
          gravel: 10,
          sand: 65,
          silt: 20,
          clay: 5,
        },
        strength: {
          cohesion: 0,
          frictionAngle: 32,
        },
      },
    ],
  });

  console.log('✅ Sample soil data created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
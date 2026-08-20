import prisma from './prisma';

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma');
  } catch (error) {
    console.error('💥 PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

export default prisma;

import { PrismaClient } from '@prisma/client';

const resolveDatabaseUrl = (): void => {
  if (process.env.DATABASE_URL) {
    return;
  }

  const fallbackDatabaseUrl =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  if (fallbackDatabaseUrl) {
    process.env.DATABASE_URL = fallbackDatabaseUrl;
  }
};

resolveDatabaseUrl();

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
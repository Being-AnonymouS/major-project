const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const bootstrapLabel = '[bootstrap-admin]';

const loadEnvironment = () => {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const resolveDatabaseUrl = () => {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
    process.env.PRISMA_DATABASE_URL,
  ];

  const resolved = candidates.find((value) => isNonEmptyString(value));
  if (!resolved) {
    return null;
  }

  process.env.DATABASE_URL = resolved;
  return resolved;
};

const resolveBcryptRounds = () => {
  const configured = Number(process.env.BCRYPT_ROUNDS || 12);
  if (Number.isFinite(configured) && configured >= 4 && configured <= 15) {
    return Math.floor(configured);
  }

  return 12;
};

const resolveBootstrapAdmin = () => {
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@mentorconnect.com').trim().toLowerCase();
  const name = (process.env.BOOTSTRAP_ADMIN_NAME || 'Administrator').trim() || 'Administrator';
  const password = (process.env.BOOTSTRAP_ADMIN_PASSWORD || 'admin123').trim();

  return { email, name, password };
};

const bootstrapAdmin = async () => {
  loadEnvironment();

  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    console.warn(`${bootstrapLabel} DATABASE_URL not found. Skipping bootstrap.`);
    return;
  }

  const prisma = new PrismaClient();

  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log(`${bootstrapLabel} Users already exist (${existingUsers}). Skipping bootstrap.`);
      return;
    }

    const admin = resolveBootstrapAdmin();
    if (!admin.password) {
      throw new Error('BOOTSTRAP_ADMIN_PASSWORD is empty');
    }

    const hashedPassword = await bcrypt.hash(admin.password, resolveBcryptRounds());

    await prisma.user.create({
      data: {
        email: admin.email,
        name: admin.name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log(`${bootstrapLabel} Created initial admin user: ${admin.email}`);

    if (!isNonEmptyString(process.env.BOOTSTRAP_ADMIN_PASSWORD)) {
      console.warn(`${bootstrapLabel} Default password "admin123" was used. Set BOOTSTRAP_ADMIN_PASSWORD and rotate admin credentials.`);
    }
  } finally {
    await prisma.$disconnect();
  }
};

bootstrapAdmin().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`${bootstrapLabel} Failed: ${message}`);
  process.exit(1);
});

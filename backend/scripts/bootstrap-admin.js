const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const bootstrapLabel = '[bootstrap-admin]';
const truthyValues = new Set(['1', 'true', 'yes', 'on']);

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

const shouldIncludeDemoUsers = () => {
  const raw = (process.env.BOOTSTRAP_INCLUDE_DEMO_USERS || 'true').trim().toLowerCase();
  return truthyValues.has(raw);
};

const resolveBootstrapUsers = () => {
  const users = [
    {
      label: 'admin',
      role: 'ADMIN',
      email: (process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@mentorconnect.com').trim().toLowerCase(),
      name: (process.env.BOOTSTRAP_ADMIN_NAME || 'Administrator').trim() || 'Administrator',
      password: (process.env.BOOTSTRAP_ADMIN_PASSWORD || 'admin123').trim(),
      usedDefaultPassword: !isNonEmptyString(process.env.BOOTSTRAP_ADMIN_PASSWORD),
      extraData: {},
    },
  ];

  if (!shouldIncludeDemoUsers()) {
    return users;
  }

  users.push(
    {
      label: 'mentor',
      role: 'MENTOR',
      email: (process.env.BOOTSTRAP_MENTOR_EMAIL || 'mentor@mentorconnect.com').trim().toLowerCase(),
      name: (process.env.BOOTSTRAP_MENTOR_NAME || 'Mentor Demo').trim() || 'Mentor Demo',
      password: (process.env.BOOTSTRAP_MENTOR_PASSWORD || 'mentor123').trim(),
      usedDefaultPassword: !isNonEmptyString(process.env.BOOTSTRAP_MENTOR_PASSWORD),
      extraData: {
        expertise: 'General Mentorship, Career Guidance',
        bio: 'Auto-bootstrap mentor account for first-time deployments.',
        yearsExperience: 5,
      },
    },
    {
      label: 'mentee',
      role: 'MENTEE',
      email: (process.env.BOOTSTRAP_MENTEE_EMAIL || 'mentee@mentorconnect.com').trim().toLowerCase(),
      name: (process.env.BOOTSTRAP_MENTEE_NAME || 'Mentee Demo').trim() || 'Mentee Demo',
      password: (process.env.BOOTSTRAP_MENTEE_PASSWORD || 'mentee123').trim(),
      usedDefaultPassword: !isNonEmptyString(process.env.BOOTSTRAP_MENTEE_PASSWORD),
      extraData: {
        institute: 'Mentor Connect Demo',
        course: 'Onboarding',
        goals: 'Validate platform login and messaging flows after deployment.',
      },
    }
  );

  return users;
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
    const bootstrapUsers = resolveBootstrapUsers();
    const configuredEmails = bootstrapUsers.map((user) => user.email);

    if (configuredEmails.some((email) => !isNonEmptyString(email))) {
      throw new Error('One or more bootstrap user emails are empty');
    }

    if (bootstrapUsers.some((user) => !isNonEmptyString(user.password))) {
      throw new Error('One or more bootstrap user passwords are empty');
    }

    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: configuredEmails,
        },
      },
      select: {
        email: true,
      },
    });

    const existingEmailSet = new Set(existingUsers.map((user) => user.email.toLowerCase()));
    const missingUsers = bootstrapUsers.filter((user) => !existingEmailSet.has(user.email));

    if (missingUsers.length === 0) {
      console.log(`${bootstrapLabel} Bootstrap users already exist. Nothing to create.`);
      return;
    }

    const rounds = resolveBcryptRounds();

    for (const user of missingUsers) {
      const hashedPassword = await bcrypt.hash(user.password, rounds);

      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          role: user.role,
          ...user.extraData,
        },
      });

      console.log(`${bootstrapLabel} Created ${user.label} user: ${user.email}`);

      if (user.usedDefaultPassword) {
        console.warn(`${bootstrapLabel} ${user.label} used default password. Set BOOTSTRAP_${user.label.toUpperCase()}_PASSWORD and rotate credentials.`);
      }
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

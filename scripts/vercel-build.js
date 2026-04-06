const { spawnSync } = require('child_process');

const truthy = new Set(['1', 'true', 'yes', 'on']);

const run = (label, command, args, env) => {
  console.log(`\n[vercel-build] ${label}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const pickFirst = (...values) => values.find((value) => isNonEmptyString(value));

const env = { ...process.env };

const databaseCandidates = [
  ['DATABASE_URL', env.DATABASE_URL],
  ['POSTGRES_PRISMA_URL', env.POSTGRES_PRISMA_URL],
  ['POSTGRES_URL_NON_POOLING', env.POSTGRES_URL_NON_POOLING],
  ['POSTGRES_URL', env.POSTGRES_URL],
];

const resolvedDatabase = databaseCandidates.find(([, value]) => isNonEmptyString(value));

if (resolvedDatabase && !isNonEmptyString(env.DATABASE_URL)) {
  const [sourceName, sourceValue] = resolvedDatabase;
  env.DATABASE_URL = sourceValue;
  console.log(`[vercel-build] Using ${sourceName} as DATABASE_URL for Prisma commands.`);
}

run('Generate Prisma Client', 'npm', ['run', 'db:generate', '--workspace=mentor-connect-backend'], env);

const explicitMigrationFlag = (env.RUN_DB_MIGRATIONS || '').trim().toLowerCase();
const shouldRunMigrations = explicitMigrationFlag
  ? truthy.has(explicitMigrationFlag)
  : env.VERCEL_ENV === 'production' || env.VERCEL_ENV === 'preview';

if (shouldRunMigrations) {
  if (!isNonEmptyString(env.DATABASE_URL)) {
    console.error('\n[vercel-build] Migration step requires DATABASE_URL (or POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING / POSTGRES_URL).');
    process.exit(1);
  }

  run('Run Prisma Migrations', 'npm', ['run', 'db:migrate', '--workspace=mentor-connect-backend'], env);
} else {
  console.log('\n[vercel-build] Skipping migrations for this build. Set RUN_DB_MIGRATIONS=true to force them.');
}

const explicitBootstrapFlag = (env.RUN_DB_BOOTSTRAP || '').trim().toLowerCase();
const shouldRunBootstrap = explicitBootstrapFlag
  ? truthy.has(explicitBootstrapFlag)
  : shouldRunMigrations;

if (shouldRunBootstrap) {
  if (!isNonEmptyString(env.DATABASE_URL)) {
    console.error('\n[vercel-build] Bootstrap step requires DATABASE_URL (or POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING / POSTGRES_URL).');
    process.exit(1);
  }

  run('Bootstrap Admin User', 'npm', ['run', 'db:bootstrap', '--workspace=mentor-connect-backend'], env);
} else {
  console.log('\n[vercel-build] Skipping admin bootstrap. Set RUN_DB_BOOTSTRAP=true to force it.');
}

run('Build Frontend', 'npm', ['run', 'build:frontend'], env);

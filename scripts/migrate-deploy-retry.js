const { execSync } = require("node:child_process");

const attempts = Number(process.env.PRISMA_MIGRATE_ATTEMPTS || 3);
const delayMs = Number(process.env.PRISMA_MIGRATE_DELAY_MS || 5000);

function runMigrateDeploy() {
  try {
    execSync("npm exec prisma migrate deploy", {
      stdio: "inherit",
      env: process.env,
    });
    return 0;
  } catch (error) {
    return typeof error?.status === "number" ? error.status : 1;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    process.stdout.write(`\n[prisma-migrate] attempt ${attempt}/${attempts}\n`);

    const code = runMigrateDeploy();

    if (code === 0) {
      process.stdout.write("[prisma-migrate] success\n");
      process.exit(0);
    }

    if (attempt < attempts) {
      process.stdout.write(
        `[prisma-migrate] failed (exit ${code}), retrying in ${delayMs}ms...\n`
      );
      await sleep(delayMs);
    }
  }

  process.stderr.write("[prisma-migrate] all attempts failed\n");
  process.exit(1);
}

main();

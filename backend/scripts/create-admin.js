import "dotenv/config";

import bcrypt from "bcryptjs";

import prisma from "../src/config/prisma.js";

const requiredEnvironmentVariables = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_MOBILE",
  "MANAGER_EMAIL",
  "MANAGER_PASSWORD",
  "MANAGER_MOBILE",
];

function readRequiredEnvironment() {
  const missingVariables = requiredEnvironmentVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
  }

  return {
    admin: {
      email: process.env.ADMIN_EMAIL.trim(),
      password: process.env.ADMIN_PASSWORD,
      mobile: process.env.ADMIN_MOBILE.trim(),
    },
    manager: {
      email: process.env.MANAGER_EMAIL.trim(),
      password: process.env.MANAGER_PASSWORD,
      mobile: process.env.MANAGER_MOBILE.trim(),
    },
  };
}

function maskEmail(email) {
  const [localPart, domain] = email.split("@");
  const visibleLocalPart = localPart.length > 1 ? localPart[0] : "*";
  return `${visibleLocalPart}***@${domain}`;
}

function validateDistinctIdentities(environment) {
  if (
    environment.admin.email === environment.manager.email ||
    environment.admin.mobile === environment.manager.mobile
  ) {
    throw new Error("Admin and manager email/mobile values must be unique");
  }
}

async function findExistingUser(client, userDetails) {
  const usersByIdentity = await Promise.all([
    client.user.findUnique({ where: { email: userDetails.email } }),
    client.user.findUnique({ where: { mobile: userDetails.mobile } }),
  ]);
  const [userByEmail, userByMobile] = usersByIdentity;

  if (userByEmail && userByMobile && userByEmail.id !== userByMobile.id) {
    throw new Error("An email and mobile number identify different users");
  }

  return userByEmail ?? userByMobile;
}

async function createOrUpdateUser(client, role, userDetails) {
  const existingUser = await findExistingUser(client, userDetails);
  const passwordHash = await bcrypt.hash(userDetails.password, 12);
  const data = {
    email: userDetails.email,
    mobile: userDetails.mobile,
    passwordHash,
    role,
    status: "ACTIVE",
  };

  if (existingUser) {
    const user = await client.user.update({ where: { id: existingUser.id }, data });
    return { action: "updated", user };
  }

  const user = await client.user.create({ data });
  return { action: "created", user };
}

async function main() {
  const environment = readRequiredEnvironment();
  validateDistinctIdentities(environment);

  const results = await prisma.$transaction(async (transaction) => {
    const admin = await createOrUpdateUser(transaction, "ADMIN", environment.admin);
    const manager = await createOrUpdateUser(transaction, "THEATRE_MANAGER", environment.manager);
    return { admin, manager };
  });

  for (const { role, action, user } of [
    { role: "ADMIN", ...results.admin },
    { role: "THEATRE_MANAGER", ...results.manager },
  ]) {
    console.log(`${role}: ${action} (${maskEmail(user.email)})`);
  }
}

try {
  await main();
} catch (error) {
  console.error(`Admin setup failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

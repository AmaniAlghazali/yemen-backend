import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Connection = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default Connection;
export { prisma };

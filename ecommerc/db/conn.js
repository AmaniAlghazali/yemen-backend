import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const Connection = async () => {
  try {
    await prisma.$connect();
    console.log("Connection successful");
  } catch (error) {
    console.log(error);
  }
};

export default Connection;
export { prisma };

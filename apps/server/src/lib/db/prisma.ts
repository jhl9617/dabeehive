export type PrismaClientInstance = {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
};

type PrismaClientConstructor = new (options?: {
  log?: string[];
}) => PrismaClientInstance;

type PrismaClientModule = {
  PrismaClient: PrismaClientConstructor;
};

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientInstance;
};

export async function getPrismaClient(): Promise<PrismaClientInstance> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const { PrismaClient } = (await import("@prisma/client")) as unknown as PrismaClientModule;
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"]
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

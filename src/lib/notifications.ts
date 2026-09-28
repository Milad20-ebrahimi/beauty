import "server-only";

import { NotificationType, Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function createCustomerNotification(db: DbClient, data: {
  userId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  href?: string | null;
  eventKey?: string | null;
}) {
  if (!data.userId) return null;
  if (data.eventKey) {
    return db.notification.upsert({
      where: { eventKey: data.eventKey },
      update: {},
      create: { ...data, userId: data.userId }
    });
  }
  return db.notification.create({ data: { ...data, userId: data.userId } });
}

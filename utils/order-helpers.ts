import { prisma } from "@/prisma/db";
import crypto from "crypto";

/**
 * Generates a unique order number in format: ORD-YYYYMMDD-XXX
 * where XXX is a 3-digit sequence number for the day
 */
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD

  // Get today's order count
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayOrderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const orderSequence = (todayOrderCount + 1).toString().padStart(3, "0");
  return `ORD-${dateStr}-${orderSequence}`;
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verifies Razorpay webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return expectedSignature === signature;
}

/**
 * Deducts stock for order items in a transaction
 */
export async function deductStockForOrder(
  orderItems: Array<{
    productId: string;
    variantDetails?: { price: number };
    quantity: number;
  }>,
  tx: any // Prisma transaction client
) {
  // Fetch all products involved in the order at once
  const productIds = orderItems.map((i) => i.productId);
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, stock: true },
  });

  // 1. Validate ALL items first in memory
  const updatePromises = orderItems.map((item) => {
    const product = products.find((p: any) => p.id === item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.title}. Available: ${product.stock}`);
    }

    // 2. Prepare update promise
    return tx.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  });

  // 3. Execute all updates in parallel within the transaction
  await Promise.all(updatePromises);
}

/**
 * Updates coupon usage for an order
 */
export async function updateCouponUsage(
  couponCode: string,
  userId: string,
  tx: any // Prisma transaction client
) {
  // 1. Fetch coupon ID (needed for upsert)
  const coupon = await tx.coupon.findUnique({
    where: { code: couponCode },
    select: { id: true },
  });

  if (!coupon) return;

  // 2. Parallelize global increment and per-user upsert
  await Promise.all([
    // Update global usage count
    tx.coupon.update({
      where: { id: coupon.id },
      data: { totalUsed: { increment: 1 } },
    }),
    // Track per-user usage using upsert
    tx.couponUsage.upsert({
      where: {
        couponId_userId: {
          couponId: coupon.id,
          userId: userId,
        },
      },
      update: { usedCount: { increment: 1 } },
      create: {
        couponId: coupon.id,
        userId: userId,
        usedCount: 1,
      },
    }),
  ]);
}

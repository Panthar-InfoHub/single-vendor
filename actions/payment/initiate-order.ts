// actions/payment/initiate-order.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/prisma/db";
import Razorpay from "razorpay";
import { OrderDetails, orderDetailsSchema } from "@/lib/zod-schema";
import { calculateShippingCharge } from "@/actions/admin/site-config.actions";
import { generateOrderNumber } from "@/utils/order-helpers";

export async function initiateOrder(orderDetails: OrderDetails) {
  // Start session fetch immediately
  const sessionPromise = auth.api.getSession({ headers: await headers() });

  const validated = orderDetailsSchema.parse(orderDetails);
  const productIds = [...new Set(validated.items.map((i) => i.productId))];

  // Parallelize ALL database lookups that don't depend on each other
  // We fetch coupon and siteConfig early even though they might be used later
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date(today).setHours(23, 59, 59, 999));

  const [session, products, todayOrderCount, coupon, siteConfig] = await Promise.all([
    sessionPromise,
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, sellingPrice: true, stock: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    }),
    validated.couponCode
      ? prisma.coupon.findUnique({
        where: { code: validated.couponCode, isActive: true },
      })
      : Promise.resolve(null),
    prisma.siteConfig.findFirst(),
  ]);

  if (!session) throw new Error("Not authenticated");
  const userId = session.user.id;

  // 1. Generate Order Number (Inlined for speed)
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
  const orderSequence = (todayOrderCount + 1).toString().padStart(3, "0");
  const orderNumber = `ORD-${dateStr}-${orderSequence}`;

  // 2. Validate stock and calculate subtotal
  let subtotal = 0;
  for (const item of validated.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.title}`);
    subtotal += product.sellingPrice * item.quantity;
  }

  // 3. Apply coupon discount (In-memory calculation)
  let discount = 0;
  if (coupon) {
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("Coupon expired");
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue)
      throw new Error("Subtotal below coupon minimum");

    if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  // 4. Calculate Shipping (In-memory calculation)
  let shippingFee = 50; // Default
  if (siteConfig) {
    if (siteConfig.shippingCharge === null) {
      shippingFee = 0;
    } else {
      const isFreeShipping =
        siteConfig.freeShippingMinOrder !== null && subtotal >= siteConfig.freeShippingMinOrder;
      shippingFee = isFreeShipping ? 0 : siteConfig.shippingCharge;
    }
  }

  const total = subtotal - discount + shippingFee;

  // 5. Create Razorpay Order
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // Amount in paise
    currency: "INR",
    receipt: orderNumber,
    notes: { userId, orderNumber },
  });

  // 6. Create order in database
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
      paymentStatus: "PENDING",
      couponCode: validated.couponCode || null,
      subtotal,
      discount,
      shippingFee,
      total,
      shippingAddress: validated.shippingAddress as any,
      billingAddress: (validated.billingAddress || validated.shippingAddress) as any,
      razorpayOrderId: razorpayOrder.id,
      items: {
        create: validated.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          variantDetails: { price: item.price } as any,
          quantity: item.quantity,
        })),
      },
    },
    select: { id: true, orderNumber: true }, // Only select what's needed for response
  });

  return {
    success: true,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: total,
      currency: "INR",
    },
  };
}

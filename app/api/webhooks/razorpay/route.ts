import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import {
  verifyWebhookSignature,
  deductStockForOrder,
  updateCouponUsage,
} from "@/utils/order-helpers";
import { sendOrderConfirmationToUser, sendOrderNotificationToAdmin } from "@/lib/send-mail";

/**
 * Razorpay Webhook Handler
 * Listens to payment events from Razorpay as a backup mechanism
 * Events handled:
 * - payment.captured: Payment successful
 * - payment.failed: Payment failed
 * - order.paid: Order paid (alternative success event)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("❌ SECURITY: Missing webhook signature");
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ CRITICAL: RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // Parse the payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    console.log(`Received webhook event: ${event}`);

    // Handle different events
    switch (event) {
      case "payment.captured":
      case "order.paid":
        await handlePaymentSuccess(paymentEntity, orderEntity);
        break;

      case "payment.failed":
        await handlePaymentFailure(paymentEntity, orderEntity);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentEntity: any, orderEntity: any) {
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;

  if (!razorpayOrderId) {
    console.error("Missing order ID in webhook payload");
    return;
  }

  console.log(`Processing payment success for order: ${razorpayOrderId}`);

  // Find order by razorpayOrderId
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
    include: { items: true },
  });

  if (!order) {
    console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
    return;
  }

  // Check if already processed
  if (order.paymentStatus === "SUCCESS") {
    console.log(`Order ${order.orderNumber} already marked as successful`);
    return;
  }

  // SECURITY: Verify payment amount matches order total
  const paidAmount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0;
  if (paidAmount > 0 && Math.abs(paidAmount - order.total) > 0.01) {
    console.error(
      `❌ SECURITY: Amount mismatch in webhook. Expected: ${order.total}, Got: ${paidAmount}`
    );
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        paymentStatus: "FAILED",
        paymentMeta: {
          error: `Amount mismatch - expected ${order.total}, got ${paidAmount}`,
          webhookPayload: paymentEntity,
        },
      },
    });
    return;
  }

  // SECURITY: Verify payment status is captured
  if (paymentEntity?.status && paymentEntity.status !== "captured") {
    console.error(`❌ SECURITY: Payment not captured in webhook. Status: ${paymentEntity.status}`);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        paymentStatus: "FAILED",
        paymentMeta: {
          error: `Payment not captured - status: ${paymentEntity.status}`,
          webhookPayload: paymentEntity,
        },
      },
    });
    return;
  }

  console.log(`✅ Webhook payment verified: ${razorpayPaymentId} - Amount: ₹${paidAmount}`);

  try {
    // Update order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
          paymentStatus: "SUCCESS",
          razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
          paymentCapturedAt: new Date(),
          paymentMethod: paymentEntity?.method || "RAZORPAY",
          paymentMeta: paymentEntity || {},
        },
        include: {
          items: true,
        },
      });

      // Deduct stock for all items (only if not already deducted)
      if (order.status === "PENDING") {
        await deductStockForOrder(
          order.items.map((item) => ({
            productId: item.productId,
            variantDetails: item.variantDetails as { weight: string; price: number },
            quantity: item.quantity,
          })),
          tx
        );
      }

      // Update coupon usage if applied
      if (order.couponCode) {
        await updateCouponUsage(order.couponCode, order.userId, tx);
      }

      return updated;
    });

    console.log(`Successfully processed payment for order: ${order.orderNumber}`);

    // Send emails asynchronously (don't block the webhook response)
    sendEmailsInBackground(updatedOrder).catch((error) => {
      console.error("Failed to send webhook emails:", error);
    });
  } catch (error: any) {
    console.error(`Error processing payment success webhook:`, error);
    throw error;
  }
}

async function handlePaymentFailure(paymentEntity: any, orderEntity: any) {
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  if (!razorpayOrderId) {
    console.error("Missing order ID in webhook payload");
    return;
  }

  console.log(`Processing payment failure for order: ${razorpayOrderId}`);

  // Find order by razorpayOrderId
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
  });

  if (!order) {
    console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
    return;
  }

  // Check if already marked as failed
  if (order.paymentStatus === "FAILED") {
    console.log(`Order ${order.orderNumber} already marked as failed`);
    return;
  }

  try {
    // Update order status to failed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        paymentStatus: "FAILED",
        paymentMeta: paymentEntity || {},
      },
    });

    console.log(`Successfully marked order as failed: ${order.orderNumber}`);
  } catch (error: any) {
    console.error(`Error processing payment failure webhook:`, error);
    throw error;
  }
}

// Helper function to send emails in the background
async function sendEmailsInBackground(order: any) {
  try {
    console.log("📧 [WEBHOOK] Preparing to send emails for order:", order.orderNumber);
    console.log(
      "📦 [WEBHOOK] Raw order data:",
      JSON.stringify(
        {
          orderNumber: order.orderNumber,
          shippingAddress: order.shippingAddress,
          total: order.total,
          paymentMethod: order.paymentMethod,
          itemCount: order.items?.length,
        },
        null,
        2
      )
    );

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    // Format order details for email
    const orderDetails = {
      orderId: order.orderNumber,
      customerName:
        [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
          .filter(Boolean)
          .join(" ") || "",
      customerEmail: order.shippingAddress?.email || "",
      customerPhone: order.shippingAddress?.phone || "",
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.variantDetails?.price || 0,
      })),
      totalAmount: order.total,
      shippingAddress: [
        order.shippingAddress?.firstName && order.shippingAddress?.lastName
          ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
          : null,
        order.shippingAddress?.address,
        order.shippingAddress?.city,
        order.shippingAddress?.state,
        order.shippingAddress?.pinCode,
        order.shippingAddress?.country,
      ]
        .filter(Boolean)
        .join(", "),
      paymentMethod: order.paymentMethod || "RAZORPAY",
      orderDate: new Date(order.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    // Log formatted order details to identify missing fields
    console.log(
      "✉️ [WEBHOOK] Formatted email data:",
      JSON.stringify(
        {
          orderId: orderDetails.orderId,
          customerName: orderDetails.customerName || "❌ MISSING",
          customerEmail: orderDetails.customerEmail || "❌ MISSING",
          customerPhone: orderDetails.customerPhone || "❌ MISSING",
          shippingAddress: orderDetails.shippingAddress || "❌ MISSING",
          itemCount: orderDetails.items.length,
          totalAmount: orderDetails.totalAmount,
        },
        null,
        2
      )
    );

    // Send both emails in parallel
    await Promise.all([
      // Send to customer
      sendOrderConfirmationToUser({
        orderId: orderDetails.orderId,
        customerName: orderDetails.customerName,
        customerEmail: orderDetails.customerEmail,
        items: orderDetails.items,
        totalAmount: orderDetails.totalAmount,
        shippingAddress: orderDetails.shippingAddress,
      }),
      // Send to all admins
      ...adminEmails.map((email) => sendOrderNotificationToAdmin(email.trim(), orderDetails)),
    ]);

    console.log("Webhook emails sent successfully");
  } catch (error) {
    // Just log the error, don't fail the webhook
    console.error("Failed to send webhook emails:", error);
  }
}

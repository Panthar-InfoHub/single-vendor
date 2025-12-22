// actions/payment/confirm-order.ts
"use server";

import { prisma } from "@/prisma/db";
import {
  verifyRazorpaySignature,
  deductStockForOrder,
  updateCouponUsage,
} from "@/utils/order-helpers";
import { sendOrderConfirmationToUser, sendOrderNotificationToAdmin } from "@/lib/send-mail";

export async function confirmOrder({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    // Step 1: Verify signature (CRITICAL SECURITY CHECK)
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error(`❌ SECURITY: Invalid payment signature for order ${orderId}`);
      // Mark order as failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: "Invalid payment signature - possible fraud attempt" },
        },
      });
      throw new Error("Payment verification failed - invalid signature");
    }

    // Step 2: Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      throw new Error("Order not found");
    }

    // Step 3: Verify the Razorpay order ID matches (SECURITY CHECK)
    if (order.razorpayOrderId !== razorpay_order_id) {
      console.error(
        `❌ SECURITY: Razorpay order ID mismatch. Expected: ${order.razorpayOrderId}, Got: ${razorpay_order_id}`
      );
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: "Order ID mismatch - possible fraud attempt" },
        },
      });
      throw new Error("Order verification failed - ID mismatch");
    }

    // Step 4: Check if order is already processed (prevent double processing)
    if (order.paymentStatus === "SUCCESS") {
      console.log(`⚠️ Order ${order.orderNumber} already processed successfully`);
      return {
        success: true,
        data: order,
        message: "Order already processed",
      };
    }

    // Step 4: Update order in transaction - SUCCESS flow
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PROCESSING",
          paymentStatus: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          paymentCapturedAt: new Date(),
          paymentMethod: "RAZORPAY",
        },
        include: {
          items: true,
        },
      });

      // Deduct stock for all items
      await deductStockForOrder(
        order.items.map((item) => ({
          productId: item.productId,
          variantDetails: item.variantDetails as { price: number },
          quantity: item.quantity,
        })),
        tx
      );

      // Update coupon usage if applied
      if (order.couponCode) {
        await updateCouponUsage(order.couponCode, order.userId, tx);
      }

      return updated;
    });

    // Send emails asynchronously (don't await - fire and forget)
    sendEmailsInBackground(updatedOrder);

    return {
      success: true,
      data: updatedOrder,
      message: "Payment confirmed successfully",
    };
  } catch (error: any) {
    console.error("Error confirming order:", error);

    // Try to mark order as failed
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: error.message || "Unknown error" },
        },
      });
    } catch (updateError) {
      console.error("Failed to update order status to failed:", updateError);
    }

    throw error;
  }
}

// Helper function to send emails in the background
async function sendEmailsInBackground(order: any) {
  try {
    console.log("📧 Preparing to send emails for order:", order.orderNumber);
    console.log(
      "📦 Raw order data:",
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
      "✉️ Formatted email data:",
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

    console.log("Order emails sent successfully");
  } catch (error) {
    // Just log the error, don't fail the order
    console.error("Failed to send order emails:", error);
  }
}

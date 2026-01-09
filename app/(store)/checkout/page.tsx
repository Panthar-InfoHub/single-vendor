import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CheckoutClient } from "./checkout-client";
import { Suspense } from "react";
import { CheckoutSkeleton } from "./checkout-skeleton";
import { prisma } from "@/prisma/db";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Fetch addresses, site config, and cart in parallel
  const [savedAddresses, siteConfig, cart] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
    prisma.siteConfig.findFirst(),
    prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                sellingPrice: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Map cart items for client
  const initialCartItems =
    cart?.items
      .filter((item) => item.product.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.title,
        slug: item.product.slug,
        image: item.product.images[0] || "/images/placeholder.png",
        price: item.product.sellingPrice,
        quantity: item.quantity,
        weight: item.weight,
        inStock: item.product.stock > 0,
        stockQuantity: item.product.stock,
      })) || [];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutClient
            userEmail={session.user.email}
            savedAddresses={savedAddresses as any}
            initialCartItems={initialCartItems as any}
            initialShippingConfig={
              siteConfig
                ? {
                  shippingCharge: siteConfig.shippingCharge,
                  freeShippingMinOrder: siteConfig.freeShippingMinOrder,
                }
                : null
            }
          />
        </Suspense>
      </div>
    </div>
  );
}

import { getAddresses } from "@/actions/store/address.actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CheckoutClient } from "./checkout-client";
import { Suspense } from "react";
import { CheckoutSkeleton } from "./checkout-skeleton";

export default async function CheckoutPage() {
  // Get session on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch saved addresses on server
  const savedAddressesResult = await getAddresses();
  const savedAddresses =
    savedAddressesResult.success && savedAddressesResult.data ? savedAddressesResult.data : [];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutClient userEmail={session?.user?.email} savedAddresses={savedAddresses} />
        </Suspense>
      </div>
    </div>
  );
}

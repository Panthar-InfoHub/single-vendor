import type React from "react";
import { AccountNav } from "@/components/store/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen py-4 sm:py-6 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm">
            Manage your profile, orders, and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-4 lg:gap-5">
          <AccountNav />
          {/* Main Content */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TimeFilter, type TimeFilter as TimeFilterType } from "@/components/admin/dashboard/time-filter";

export function DashboardHeader({ initialFilter }: { initialFilter: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleFilterChange = (value: TimeFilterType) => {
        startTransition(() => {
            router.push(`/admin?filter=${value}`);
        });
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground mt-1">
                    {isPending ? "Updating dashboard..." : "Your store performance at a glance"}
                </p>
            </div>
            <TimeFilter value={initialFilter as any} onValueChange={handleFilterChange} />
        </div>
    );
}

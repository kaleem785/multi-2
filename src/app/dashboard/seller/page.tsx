import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function SellerDashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/");
  const stores = await db.store.findMany({
    where: {
      id: user.id,
    },
  });
  if (stores.length === 0) redirect("/dashboard/seller/stores/new");
  redirect(`/dashboard/seller/stores/${stores[0].url}`);
  return <div>Seller Dashboard Page</div>;
}

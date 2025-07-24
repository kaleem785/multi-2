import StoreDetails from "@/components/dashboard/forms/store-details";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

export default async function SellerStoreSettingsPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const storeDatetails = await db.store.findUnique({
    where: {
      url: params.storeUrl,
    },
  });
  if (!storeDatetails) redirect("/dashboard/seller/stores");
  return (
    <div>
      <StoreDetails data={storeDatetails} />
    </div>
  );
}

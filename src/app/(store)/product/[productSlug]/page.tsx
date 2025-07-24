import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProductPage({
  params,
}: {
  params: { productSlug: string };
}) {
  //Fetch the product form the database from the provided slug

  const product = await db.product.findUnique({
    where: {
      slug: params.productSlug,
    },
    include: {
      variants: true,
    },
  });

  if (!product) {
    return redirect("/");
  }
  //if the product have no variants, redirect to homepage
  if (!product.variants.length) {
    return redirect("/");
  }
  // if the product exist and has variant, redirect to the first variant's page

  return redirect(`/product/${product.slug}/${product.variants[0].slug}`);
}

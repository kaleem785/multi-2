import ProductDetails from "@/components/dashboard/forms/product-details";
import { getAllCategories } from "@/queries/category";
import { getProductMainInfo } from "@/queries/product";
import React from "react";

export default async function SellerNewProductVariantPage({
  params,
}: {
  params: { storeUrl: string; productId: string };
}) {
  const { storeUrl, productId } = params;
  const categories = await getAllCategories();
  const product = await getProductMainInfo(productId);
  if (!product) {
    return null;
  }

  return (
    <div>
      <ProductDetails
        categories={categories}
        storeUrl={storeUrl}
        data={product}
      />
    </div>
  );
}

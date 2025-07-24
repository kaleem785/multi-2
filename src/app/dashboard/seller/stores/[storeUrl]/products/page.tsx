import DataTable from "@/components/ui/data-table";
import { getAllProductsForStore } from "@/queries/product";
import React from "react";
import { columns } from "./cloumns";
import { Plus } from "lucide-react";
import ProductDetails from "@/components/dashboard/forms/product-details";
import { getAllCategories } from "@/queries/category";

export default async function SellerProductPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const { storeUrl } = params;
  //Fetching product data from the database for the active store
  const products = await getAllProductsForStore(storeUrl);
  const categories = await getAllCategories();
  return (
    <DataTable
      actionButtonText={
        <>
          <Plus />
          Create Product
        </>
      }
      modalChildren={
        <ProductDetails categories={categories} storeUrl={storeUrl} />
      }
      newTabLink={`/dashboard/seller/stores/${storeUrl}/products/new`}
      filterValue='name'
      data={products}
      columns={columns}
      searchPlaceholder='Search product name...'
    />
  );
}

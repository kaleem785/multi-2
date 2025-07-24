import SubCategoryDetails from "@/components/dashboard/forms/subCategory-details";
import { getAllCategories } from "@/queries/category";
import { Sub } from "@radix-ui/react-dropdown-menu";
import React from "react";

export default async function page() {
  const categories = await getAllCategories();

  if (!categories) return null;
  return <SubCategoryDetails categories={categories} />;
}

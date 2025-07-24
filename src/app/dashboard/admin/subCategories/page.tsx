import SubCategoryDetails from "@/components/dashboard/forms/subCategory-details";
import DataTable from "@/components/ui/data-table";
import { getAllCategories } from "@/queries/category";
import { getAllSubCategories } from "@/queries/subCategory";
import { Plus } from "lucide-react";
import React from "react";
import { columns } from "./cloumns";

export default async function AdminSubCategoriesPage() {
  const categories = await getAllCategories();
  if (!categories || categories.length === 0) {
    return (
      <div className='p-4 text-center text-gray-600'>
        No categories available. Please create a category before adding
        subcategories.
      </div>
    );
  }

  const subCategories = await getAllSubCategories();

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create SubCategory
        </>
      }
      modalChildren={<SubCategoryDetails categories={categories} />}
      columns={columns}
      data={subCategories}
      filterValue='name'
      searchPlaceholder='Search SubCategories'
      newTabLink='/dashboard/admin/subCategories/new'
    />
  );
}

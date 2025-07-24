import CategoryDetails from "@/components/dashboard/forms/category-details";
import DataTable from "@/components/ui/data-table";
import { getAllCategories } from "@/queries/category";
import { Plus } from "lucide-react";
import React from "react";
import { columns } from "./cloumns";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  if (!categories) return null;

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create Category
        </>
      }
      modalChildren={<CategoryDetails />}
      newTabLink='/dashboard/admin/categories/new'
      filterValue='name'
      data={categories}
      searchPlaceholder='Search category name...'
      columns={columns}
    />
  );
}

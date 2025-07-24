"use server";
// Function: upsertCategory
// Description: Upserts a category into the database, updating if it exists or creating a new one if not.
// Permission Level: Admin only
// Parameters:
//   - category: Category object containing details of the category to be upserted.
// Returns: Updated or newly created category details.

import { Category } from "@/generated/prisma";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const upsertCategory = async (category: Category) => {
  try {
    const user = await currentUser();
    if (!user || user?.privateMetadata?.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }
    if (!category) {
      throw new Error("Please provide a category to upsert");
    }
    // Throw error if category with same name or URL already exists and not the same ID
    const existingCategory = await db.category.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: category.name }, { url: category.url }],
          },
          { NOT: { id: category.id } },
        ],
      },
    });
    if (existingCategory) {
      throw new Error(
        `Category with name "${category.name}" or URL "${category.url}" already exists.`
      );
    }
    // Upsert the category
    const categoryDetails = await db.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
    return categoryDetails;
  } catch (error: any) {
    console.error("Error upserting category:", error);
    throw new Error(`Failed to upsert category: ${error.message}`);
  }
};

// Function: getAllsubCategoriesForCategory
// Description: Retrieves all SubCategories fro a category from the database.
// Permission Level: Public
// Returns: Array of subCategories of category sorted by updatedAt date in descending order.

export const getAllsubCategoriesForCategory = async (categoryId: string) => {
  // Ensure category ID is provided
  if (!categoryId) throw new Error("Please provide category ID.");

  try {
    const subCategories = await db.subCategory.findMany({
      where: { categoryId },
      orderBy: { updatedAt: "desc" },
    });
    return subCategories;
  } catch (error: any) {
    console.error("Error fetching subCategories for category:", error);
    throw new Error(
      `Failed to fetch subCategories for category: ${error.message}`
    );
  }
};
// Function: getAllCategories
// Description: Retrieves all categories from the database.
// Permission Level: Public
// Returns: Array of categories sorted by updatedAt date in descending order.

export const getAllCategories = async () => {
  try {
    const categories = await db.category.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return categories;
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
};

// Function: getCategory
// Description: Retrieves a specific category from the database.
// Access Level: Public
// Parameters:
//   - categoryId: The ID of the category to be retrieved.
// Returns: Details of the requested category.
export const getCategory = async (categoryId: string) => {
  // Ensure category ID is provided
  if (!categoryId) throw new Error("Please provide category ID.");

  // Retrieve category
  const category = await db.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  return category;
};

// Function: deleteCategory
// Description: Deletes a category from the database.
// Permission Level: Admin only
// Parameters:
//   - categoryId: The ID of the category to be deleted.
// Returns: Response indicating success or failure of the deletion operation.
export const deleteCategory = async (categoryId: string) => {
  // Get current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Verify admin permission
  if (user.privateMetadata.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );

  // Ensure category ID is provided
  if (!categoryId) throw new Error("Please provide category ID.");

  // Delete category from the database
  const response = await db.category.delete({
    where: {
      id: categoryId,
    },
  });
  return response;
};

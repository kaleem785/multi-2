"use server";
import { SubCategory } from "@/generated/prisma";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

// Function: upsertSubCategory
// Description: Upserts a subCategory into the database, updating if it exists or creating a new one if not.
// Permission Level: Admin only
// Parameters:
//   - SubCategory: subCategory object containing details of the subCategory to be upserted.
// Returns: Updated or newly created subCategory details.
export const upsertSubCategory = async (subCategory: SubCategory) => {
  try {
    const user = await currentUser();
    if (!user || user?.privateMetadata?.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }
    if (!subCategory) {
      throw new Error("Please provide a subCategory to upsert");
    }

    // Throw error if subCategory with same name or URL already exists and not the same ID
    const existingSubCategory = await db.subCategory.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: subCategory.name }, { url: subCategory.url }],
          },
          { NOT: { id: subCategory.id } },
        ],
      },
    });
    if (existingSubCategory) {
      throw new Error(
        `SubCategory with name "${subCategory.name}" or URL "${subCategory.url}" already exists.`
      );
    }
    // Upsert the subCategory
    const subCategoryDetails = await db.subCategory.upsert({
      where: { id: subCategory.id },
      update: subCategory,
      create: subCategory,
    });
    return subCategoryDetails;
  } catch (error: any) {
    console.error("Error upserting subCategory:", error);
    throw new Error(`Failed to upsert subCategory: ${error.message}`);
  }
};

// Function: getAllSubCategories
// Description: Retrieves all subCategories from the database.
// Permission Level: Public
// Returns: Array of categories sorted by updatedAt date in descending order.
export const getAllSubCategories = async () => {
  try {
    const subCategories = await db.subCategory.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    });
    return subCategories;
  } catch (error: any) {
    console.error("Error fetching subCategories:", error);
    throw new Error(`Failed to fetch subCategories: ${error.message}`);
  }
};

// Function: getSubCategory
// Description: Retrieves a specific SubCategory from the database.
// Access Level: Public
// Parameters:
//   - SubCategoryId: The ID of the SubCategory to be retrieved.
// Returns: Details of the requested SubCategory.
export const getSubCategory = async (subCategoryId: string) => {
  try {
    if (!subCategoryId) {
      throw new Error("Please provide a subCategory ID");
    }
    const subCategory = await db.subCategory.findUnique({
      where: { id: subCategoryId },
    });
    if (!subCategory) {
      throw new Error(`SubCategory with ID "${subCategoryId}" not found.`);
    }
    return subCategory;
  } catch (error: any) {
    console.error("Error fetching subCategory:", error);
    throw new Error(`Failed to fetch subCategory: ${error.message}`);
  }
};
// Function: deleteSubCategory
// Description: Deletes a SubCategory from the database.
// Permission Level: Admin only
// Parameters:
//   - SubCategoryId: The ID of the SubCategory to be deleted.
// Returns: Response indicating success or failure of the deletion operation.
export const deleteSubCategory = async (subCategoryId: string) => {
  try {
    const user = await currentUser();
    if (!user || user?.privateMetadata?.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }
    if (!subCategoryId) {
      throw new Error("Please provide a subCategory ID to delete");
    }
    const deletedSubCategory = await db.subCategory.delete({
      where: { id: subCategoryId },
    });
    return deletedSubCategory;
  } catch (error: any) {
    console.error("Error deleting subCategory:", error);
    throw new Error(`Failed to delete subCategory: ${error.message}`);
  }
};
// Function: getSubcategories
// Description: Retrieves subcategories from the database, with options for limiting results and random selection.
// Parameters:
//   - limit: Number indicating the maximum number of subcategories to retrieve.
//   - random: Boolean indicating whether to return random subcategories.
// Returns: List of subcategories based on the provided options.
export const getSubcategories = async (
  limit = 10,
  random = false
): Promise<SubCategory[]> => {
  try {
    if (random) {
      const subcategories = await db.$queryRawUnsafe(`
        SELECT * FROM SubCategory
        ORDER BY RAND()
        LIMIT ${limit}
      `);
      return subcategories as SubCategory[];
    }

    const subcategories = await db.subCategory.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
    return subcategories;
  } catch (error: any) {
    console.error("Error fetching subcategories:", error);
    throw new Error(`Failed to fetch subcategories: ${error.message}`);
  }
};

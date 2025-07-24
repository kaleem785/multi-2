"use server";
import { OfferTag } from "@/generated/prisma";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

// Function: getAllOfferTags
// Description: Retrieves all offer tags from the database.
// Permission Level: Public
// Returns: Array of offer tags sorted by updatedAt date in ascending order.

// export async function getAllOfferTags(storeUrl?: string) {
//   try {
//     let storeId: string | undefined;
//     // If storeUrl is provided, filter offer tags by store URL
//     if (storeUrl) {
//       const store = await db.store.findUnique({
//         where: { url: storeUrl },
//       });
//       if (!store) {
//         throw new Error(`Store with URL ${storeUrl} not found.`);
//       }
//       storeId = store.id;
//     }

//     const offerTags = await db.offerTag.findMany({
//       where: storeId ? { products: { some: { storeId } } } : {},
//       orderBy: { updatedAt: "asc" },
//       include: {
//         products: {
//           select: {
//             id: true,
//           },
//         },
//       },
//     });
//     return offerTags;
//   } catch (error: any) {
//     console.error("Error fetching offer tags:", error);
//     throw new Error(`Failed to fetch offer tags: ${error.message}`);
//   }
// }
export async function getAllOfferTags() {
  const offerTags = await db.offerTag.findMany({
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      products: {
        _count: "desc",
      },
    },
  });
  return offerTags;
}

// Function: upsertOfferTag
// Description: Upserts an offer tag into the database, updating if it exists or creating a new one if not.
// Permission Level: Admin only
// Parameters:
//   - offerTag: OfferTag object containing details of the offer tag to be upserted.
// Returns: Updated or newly created offer tag details.

export async function upsertOfferTag(offerTag: OfferTag) {
  try {
    const user = await currentUser();
    if (!user || user?.privateMetadata?.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }
    if (!offerTag) {
      throw new Error("Please provide an offer tag to upsert");
    }

    // Check if an offer tag with the same name or URL already exists
    const existingOfferTag = await db.offerTag.findFirst({
      where: {
        AND: [
          { OR: [{ name: offerTag.name }, { url: offerTag.url }] },
          { NOT: { id: offerTag.id } },
        ],
      },
    });

    if (existingOfferTag) {
      throw new Error(
        `Offer tag with name "${offerTag.name}" or URL "${offerTag.url}" already exists.`
      );
    }

    // Upsert the offer tag
    const offerTagDetails = await db.offerTag.upsert({
      where: { id: offerTag.id },
      update: offerTag,
      create: offerTag,
    });

    return offerTagDetails;
  } catch (error: any) {
    console.error("Error upserting offer tag:", error);
    throw new Error(`Failed to upsert offer tag: ${error.message}`);
  }
}

// Function: getOfferTag
// Description: Retrieves a specific OfferTag from the database.
// Access Level: Public
// Parameters:
//   - offerTagId: The ID of the OfferTag to be retrieved.
// Returns: Details of the requested OfferTag.

export async function getOfferTag(offerTagId: string) {
  if (!offerTagId) throw new Error("Please provide offer tag ID.");

  try {
    const offerTag = await db.offerTag.findUnique({
      where: { id: offerTagId },
    });

    if (!offerTag) {
      throw new Error(`Offer tag with ID ${offerTagId} not found.`);
    }

    return offerTag;
  } catch (error: any) {
    console.error("Error retrieving offer tag:", error);
    throw new Error(`Failed to retrieve offer tag: ${error.message}`);
  }
}

// Function: deleteOfferTag
// Description: Deletes an offer tag from the database by its ID.
// Permission Level: Admin only
// Parameters:
//   - offerTagId: The ID of the offer tag to be deleted.
// Returns: A success message if the offer tag is deleted, or an error if it fails.

export async function deleteOfferTag(offerTagId: string) {
  try {
    const user = await currentUser();
    if (!user || user?.privateMetadata?.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }
    if (!offerTagId) throw new Error("Please provide offer tag ID.");

    const deletedOfferTag = await db.offerTag.delete({
      where: { id: offerTagId },
    });

    return `Offer tag with ID ${deletedOfferTag.id} deleted successfully.`;
  } catch (error: any) {
    console.error("Error deleting offer tag:", error);
    throw new Error(`Failed to delete offer tag: ${error.message}`);
  }
}

"use server";

import { Country, Store } from "@/generated/prisma";
import { db } from "@/lib/db";
import {
  FreeShippingWithCountriesType,
  ProductPageType,
  ProductShippingDetailsType,
  ProductWithVariantType,
  RatingStatisticsType,
  SortOrder,
  VariantImageType,
  VariantSimplified,
} from "@/lib/types";
import { generateUniqueSlug } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

// Cookies

import { getCookie } from "cookies-next/server";
import { cookies } from "next/headers";

// Function: upsertProduct
// Description: Upserts a product and its variant into the database, ensuring proper association with the store.
// Access Level: Seller Only
// Parameters:
//   - product: ProductWithVariant object containing details of the product and its variant.
//   - storeUrl: The URL of the store to which the product belongs.
// Returns: Newly created or updated product with variant details.

export const upsertProduct = async (
  product: ProductWithVariantType,
  storeUrl: string
) => {
  try {
    const user = await currentUser();
    if (!user || user?.privateMetadata?.role !== "SELLER") {
      throw new Error("Unauthorized: Seller access required");
    }
    if (!product) {
      throw new Error("Please provide a product to upsert");
    }
    // Ensure the product has a valid store URL
    if (!storeUrl) {
      throw new Error("Store URL is required for product association");
    }
    // Check if the product already exists
    const existingProduct = await db.product.findUnique({
      where: {
        id: product.productId,
      },
    });
    //find the store by URL
    const store = await db.store.findUnique({
      where: { url: storeUrl },
    });
    if (!store) {
      throw new Error(`Store with URL "${storeUrl}" does not exist.`);
    }
    //Generate a slug for the product
    const productSlug = await generateUniqueSlug(
      product.name,
      "product",
      "slug"
    );
    const variantSlug = await generateUniqueSlug(
      product.variantName,
      "productVariant",
      "slug"
    );
    //Common data for product and variant
    const commonProductData = {
      name: product.name,
      description: product.description || "",
      slug: productSlug,
      brand: product.brand || "",
      question: {
        create: product.questions.map((question) => ({
          question: question.question,
          answer: question.answer || "",
        })),
      },
      specs: {
        create: product.product_specs.map((spec) => ({
          name: spec.name,
          value: spec.value,
        })),
      },
      store: {
        connect: { id: store.id },
      },
      category: { connect: { id: product.categoryId } },
      subCategory: { connect: { id: product.subCategoryId } },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    const commonVariantData = {
      variantName: product.variantName,
      variantDescription: product.variantDescription || "",
      slug: variantSlug,
      isSale: product.isSale || false,
      saleEndDate: product.isSale ? product.saleEndDate : "",
      sku: product.sku || "",
      weight: product.weight,
      keywords: product.keywords.join(","),
      specs: {
        create: product.variant_specs.map((spec) => ({
          name: spec.name,
          value: spec.value,
        })),
      },
      images: {
        create: product.images.map((image) => ({
          url: image.url,
          alt: image.url.split("/").pop() || "",
        })),
      },
      variantImage: product.variantImage,
      colors: {
        create: product.colors.map((color) => ({
          name: color.color,
        })),
      },
      sizes: {
        create: product.sizes.map((size) => ({
          size: size.size,
          quantity: size.quantity,
          price: size.price,
          discount: size.discount,
        })),
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    // if product exists, create a variant
    if (existingProduct) {
      const variantData = {
        id: product.variantId,
        ...commonVariantData,
        product: {
          connect: { id: existingProduct.id },
        },
      };
      return await db.productVariant.create({
        data: variantData,
      });
    } else {
      // If the product does not exist, create it along with its variant
      const productData = {
        id: product.productId,
        ...commonProductData,
        variants: {
          create: {
            ...commonVariantData,
            id: product.variantId,
          },
        },
      };
      return await db.product.create({
        data: productData,
      });
    }

    // If the product exists, update it; otherwise, create a new one
  } catch (error: any) {
    console.error("Error upserting product:", error);
    throw new Error(`Failed to upsert product: ${error.message}`);
  }
};

// Function: getProductMainInfo
// Description: Retrieves the main data of a product by its ID, including its variants and associated store.
// Access Level: Public
// Parameters:
//   - productId: The ID of the product to retrieve.
// Returns: An Object containing the product main information or null if product is not found.

export const getProductMainInfo = async (productId: string) => {
  if (!productId) throw new Error("Please provide a product ID.");
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found.`);
    }
    return {
      productId: product.id,
      name: product.name,
      description: product.description,
      brand: product.brand,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      store: product.storeId,
    };
  } catch (error: any) {
    console.error("Error fetching product main info:", error);
    throw new Error(`Failed to fetch product main info: ${error.message}`);
  }
};

// Function: getAllProductsForStore
// Description: Retrieves all products for a specific store, including their variants and associated details.
// Access Level: public
// Parameters:
//   - storeUrl: The URL of the store to retrieve products from.
// Returns: An array of products with their variants and associated details.

export const getAllProductsForStore = async (storeUrl: string) => {
  try {
    if (!storeUrl) throw new Error("Please provide a store URL.");
    const store = await db.store.findUnique({
      where: { url: storeUrl },
    });
    if (!store) {
      throw new Error(`Store with URL "${storeUrl}" does not exist.`);
    }
    const products = await db.product.findMany({
      where: { storeId: store.id },
      include: {
        category: true,
        subCategory: true,
        variants: {
          include: {
            images: true,
            colors: true,
            sizes: true,
          },
        },
        store: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });
    return products;
  } catch (error: any) {
    console.error("Error fetching products for store:", error);
    throw new Error(`Failed to fetch products for store: ${error.message}`);
  }
};

// Function: deleteProduct
// Description: Deletes a product by its ID, including all associated variants and images.
// Access Level: Seller Only
// Parameters:
//   - productId: The ID of the product to delete.
// Returns: A boolean indicating whether the deletion was successful.

export const deleteProduct = async (productId: string) => {
  try {
    const user = await currentUser();
    if (!user || user?.privateMetadata?.role !== "SELLER") {
      throw new Error("Unauthorized: Seller access required");
    }
    if (!productId) throw new Error("Please provide a product ID.");
    const product = await db.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found.`);
    }
    await db.product.delete({
      where: { id: productId },
    });
    return true;
  } catch (error: any) {
    console.error("Error deleting product:", error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

// Function: getProducts
// Description: Retrieves products based on various filters and returns only variants that match the filters. Supports pagination.
// Access Level: Public
// Parameters:
//   - filters: An object containing filter options (category, subCategory, offerTag, size, onSale, onDiscount, brand, color).
//   - sortBy: Sort the filtered results (Most popular, New Arivals, Top Rated...).
//   - page: The current page number for pagination (default = 1).
//   - pageSize: The number of products per page (default = 10).
// Returns: An object containing paginated products, filtered variants, and pagination metadata (totalPages, currentPage, pageSize, totalCount).

export const getProducts = async (
  filters: any = {},
  sortBy = "",
  page: number = 1,
  pageSize: number = 10
) => {
  //Default values for page and pageSize
  const currentPage = page;
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;

  //Construct the base query
  const whereClause: any = {
    AND: [],
  };

  // Apply store filter (using store URL)
  if (filters.store) {
    const store = await db.store.findUnique({
      where: {
        url: filters.store,
      },
      select: { id: true },
    });
    if (store) {
      whereClause.AND.push({ storeId: store.id });
    }
  }

  // Apply category filter (using category URL)
  if (filters.category) {
    const category = await db.category.findUnique({
      where: {
        url: filters.category,
      },
      select: {
        id: true,
      },
    });
    if (category) {
      whereClause.AND.push({ categoryId: category.id });
    }
  }
  // Apply subCategory filter (using subCategory URL)
  if (filters.subCategory) {
    const subCategory = await db.subCategory.findUnique({
      where: {
        url: filters.subCategory,
      },
      select: {
        id: true,
      },
    });
    if (subCategory) {
      whereClause.AND.push({ subCategoryId: subCategory.id });
    }
  }

  //Get all filtered, sorted products
  const products = await db.product.findMany({
    where: whereClause,
    take: limit, //Limit the page size
    skip: skip, // Skip the products of previous page
    include: {
      variants: {
        include: {
          sizes: true,
          images: true,
          colors: true,
        },
      },
    },
  });

  // Transform the products with filtered variants into ProductCardType structure

  const productsWithFilteredVariants = products.map((product) => {
    const filteredVariants = product.variants;
    // Transform the filtered variants into the VariantSimplified structure

    const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
      variantId: variant.id,
      variantName: variant.variantName,
      variantSlug: variant.slug,
      images: variant.images,
      sizes: variant.sizes,
    }));
    //Extract variant images for the product
    const variantImages: VariantImageType[] = filteredVariants.map(
      (variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      })
    );

    // return the product in the ProductCardType structure
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      variants,
      variantImages,
    };
  });

  //Retrieve products matching the filters
  // const totalCount = await db.product.count({
  //   where: whereClause,
  // });

  const totalCount = products.length;

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    products: productsWithFilteredVariants,
    totalPages,
    currentPage,
    pageSize,
    totalCount,
  };
};

// Function: getProductPageData
// Description: Retrieves details of a specific product variant from the database.
// Access Level: Public
// Parameters:
//   - productId: The slug of the product to which the variant belongs.
//   - variantId: The slug of the variant to be retrieved.
// Returns: Details of the requested product variant.

export const getProductPageData = async (
  productSlug: string,
  variantSlug: string
) => {
  //Get current user
  const user = await currentUser();
  // Retrieve product variant details from teh database
  const product = await retrieveProductDetails(productSlug, variantSlug);
  if (!product) return;
  const userCountry = await getUserCountry();
  // Calculate and retrieve the shipping details
  const productShippingDetails = await getShippingDetails(
    product.shippingFeeMethod,
    userCountry,
    product.store,
    product.freeShipping
  );

  // Fetch store followers count
  const storeFollowersCount = await getStoreFollowersCount(product.storeId);

  const isUserFollowingStore = await checkIfUserFollowingStore(
    product.storeId,
    user?.id
  );

  const ratingStatistics = await getRatingStatistics(product.id);

  return formatProductResponse(
    product,
    productShippingDetails,
    storeFollowersCount,
    isUserFollowingStore,
    ratingStatistics
  );
};

//Helper functions

export const retrieveProductDetails = async (
  productSlug: string,
  variantSlug: string
) => {
  const product = await db.product.findUnique({
    where: {
      slug: productSlug,
    },
    include: {
      category: true,
      subCategory: true,
      offerTag: true,
      store: true,
      specs: true,
      questions: true,
      reviews: {
        include: {
          images: true,
          user: true,
        },
        take: 4,
      },
      freeShipping: {
        include: {
          eligibleCountries: true,
        },
      },
      variants: {
        where: {
          slug: variantSlug,
        },
        include: {
          images: true,
          colors: true,
          sizes: true,
          specs: true,
        },
      },
    },
  });
  if (!product) return null;
  //Get variant info
  const variantsInfo = await db.productVariant.findMany({
    where: {
      productId: product.id,
    },
    include: {
      images: true,
      sizes: true,
      colors: true,
      product: {
        select: {
          slug: true,
        },
      },
    },
  });

  return {
    ...product,
    variantsInfo: variantsInfo.map((variant) => ({
      variantName: variant.variantName,
      variantSlug: variant.slug,
      variantImage: variant.variantImage,
      variantUrl: `/product/${productSlug}/${variant.slug}`,
      images: variant.images,
      sizes: variant.sizes,
      colors: variant.colors,
    })),
  };
};

const getUserCountry = async () => {
  const userCountryCookie = (await getCookie("userCountry", { cookies })) || "";
  const defaultCountry = { name: "United States", code: "US" };
  try {
    const parsedCountry = JSON.parse(userCountryCookie);
    if (
      parsedCountry &&
      typeof parsedCountry === "object" &&
      "name" in parsedCountry &&
      "code" in parsedCountry
    ) {
      return parsedCountry;
    }
    return defaultCountry;
  } catch (error) {
    console.log("Failed to parse userCountryCookie", error);
  }
};

export const formatProductResponse = (
  product: ProductPageType,
  shippingDetails: ProductShippingDetailsType,
  storeFollowersCount: number,
  isUserFollowingStore: boolean,
  ratingStatistics: RatingStatisticsType
) => {
  if (!product) return;
  const variant = product.variants[0];
  const {
    store,
    category,
    subCategory,
    offerTag,
    questions,
    variantsInfo,
    reviews,
  } = product;

  const { images, colors, sizes } = variant;

  return {
    productId: product.id,
    variantId: variant.id,
    productSlug: product.slug,
    variantSlug: variant.slug,
    name: product.name,
    description: product.description,
    variantName: variant.variantName,
    variantDescription: variant.variantDescription,
    images,
    category,
    subCategory,
    offerTag,
    isSale: variant.isSale,
    saleEndDate: variant.saleEndDate,
    brand: product.brand,
    sku: variant.sku,
    weight: variant.weight,
    variantImage: variant.variantImage,
    store: {
      id: store.id,
      url: store.url,
      name: store.name,
      logo: store.logo,
      followersCount: storeFollowersCount,
      isUserFollowingStore,
    },
    colors,
    sizes,
    specs: {
      product: product.specs,
      variant: variant.specs,
    },
    questions,
    rating: product.rating,
    reviews,
    reviewStatistics: ratingStatistics,
    shippingDetails,
    relatedProducts: [],
    variantsInfo: product.variantsInfo,
  };
};

const getStoreFollowersCount = async (storeId: string) => {
  const storeFollowersCount = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });
  return storeFollowersCount?._count.followers || 0;
};

const checkIfUserFollowingStore = async (
  storeId: string,
  userId: string | undefined
) => {
  let isUserFollowingStore = false;
  if (userId) {
    const storeFollowersInfo = await db.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        followers: {
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        },
      },
    });
    if (storeFollowersInfo && storeFollowersInfo.followers.length > 0) {
      isUserFollowingStore = true;
    }
  }
  return isUserFollowingStore;
};

export const getRatingStatistics = async (productId: string) => {
  const ratingStats = await db.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: {
      rating: true,
    },
  });
  const totalReviews = ratingStats.reduce(
    (sum, stat) => sum + stat._count.rating,
    0
  );
  const ratingCounts = Array(5).fill(0);
  ratingStats.forEach((stat) => {
    let rating = Math.floor(stat.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1] = stat._count.rating;
    }
  });
  return {
    ratingStatistics: ratingCounts.map((count, index) => ({
      rating: index + 1,
      numReviews: count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    })),
    reviewsWithImagesCount: await db.review.count({
      where: {
        productId,
        images: { some: {} },
      },
    }),
    totalReviews,
  };
};

// Function: getShippingDetails
// Description: Retrieves and calculates shipping details based on user country and product.
// Access Level: Public
// Parameters:
//   - shippingFeeMethod: The shipping fee method of the product.
//   - userCountry: The parsed user country object from cookies.
//   - store :  store details.
// Returns: Calculated shipping details.

export const getShippingDetails = async (
  shippingFeeMethod: string,
  userCountry: { name: string; code: string; city: string },
  store: Store,
  freeShipping: FreeShippingWithCountriesType | null
) => {
  let shippingDetails = {
    shippingFeeMethod,
    shippingService: store.defaultShippingService,
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: 0,
    deliveryTimeMax: 0,
    returnPolicy: store.returnPolicy,
    countryCode: userCountry.code,
    countryName: userCountry.name,
    city: userCountry.city,
    isFreeShipping: false,
  };
  const country = await db.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  });
  if (country) {
    //Retrieve shipping rate for the country
    const shippingRate = await db.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    });

    const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy;
    const shippingService =
      shippingRate?.shippingService || store.defaultShippingService;
    const shippingFeePerItem =
      shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem;
    const shippingFeeAdditionalItem =
      shippingRate?.shippingFeeAdditionalItem ||
      store.defaultShippingFeeAdditionalItem;
    const shippingFeePerKg =
      shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg;
    store.defaultShippingFeeAdditionalItem;
    const shippingFeeFixed =
      shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed;
    store.defaultShippingFeeAdditionalItem;
    const deliveryTimeMin =
      shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin;
    const deliveryTimeMax =
      shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax;

    //Check for free shipping

    if (freeShipping) {
      const free_shipping_countries = freeShipping.eligibleCountries;
      const check_free_shipping = free_shipping_countries.find(
        (c) => c.countryId === country.id
      );
      if (check_free_shipping) {
        shippingDetails.isFreeShipping = true;
      }
    }

    shippingDetails = {
      shippingFeeMethod,
      shippingService: shippingService,
      shippingFee: 0,
      extraShippingFee: 0,
      deliveryTimeMin,
      deliveryTimeMax,
      returnPolicy,
      countryCode: userCountry.code,
      countryName: userCountry.name,
      city: userCountry.city,
      isFreeShipping: shippingDetails.isFreeShipping,
    };
    const { isFreeShipping } = shippingDetails;
    switch (shippingFeeMethod) {
      case "ITEM":
        shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerItem;
        shippingDetails.extraShippingFee = isFreeShipping
          ? 0
          : shippingFeeAdditionalItem;
        break;
      case "WEIGHT":
        shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerKg;
        break;
      case "FIXED":
        shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeeFixed;
        break;
      default:
        break;
    }
    return shippingDetails;
  }
  return false;
};

// Function: getProductFilteredReviews
// Description: Retrieves filtered and sorted reviews for a product from the database, based on rating, presence of images, and sorting options.
// Access Level: Public
// Parameters:
//   - productId: The ID of the product for which reviews are being fetched.
//   - filters: An object containing the filter options such as rating and whether reviews include images.
//   - sort: An object defining the sort order, such as latest, oldest, or highest rating.
//   - page: The page number for pagination (1-based index).
//   - pageSize: The number of reviews to retrieve per page.
// Returns: A paginated list of reviews that match the filter and sort criteria.

export const getProductFilteredReviews = async (
  productId: string,
  filters: { rating?: number; hasImages?: boolean },
  sort: { orderBy: "latest" | "oldest" | "highest" } | undefined,
  page: number = 1,
  pageSize: number = 4
) => {
  const reviewFilter: any = {
    productId,
  };
  // Apply rating filter if provided
  if (filters.rating) {
    const rating = filters.rating;
    reviewFilter.rating = {
      in: [rating, rating + 0.5],
    };
  }
  // Apply image filter if provided
  if (filters.hasImages) {
    reviewFilter.images = {
      some: {},
    };
  }
  const sortOption: { createdAt?: SortOrder; rating?: SortOrder } =
    sort && sort.orderBy === "latest"
      ? { createdAt: "desc" }
      : sort && sort.orderBy === "oldest"
      ? { createdAt: "asc" }
      : { rating: "desc" };
  // Calculate pagination parameters
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  //fetch reviews from the database

  const reviews = await db.review.findMany({
    where: reviewFilter,
    include: {
      images: true,
      user: true,
    },
    orderBy: sortOption,
    skip,
    take,
  });

  return reviews;
};

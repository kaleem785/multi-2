import {
  FreeShipping,
  FreeShippingCountry,
  ProductVariantImage,
  Review,
  ReviewImage,
  ShippingRate,
  Size,
  User,
} from "@/generated/prisma";
import {
  formatProductResponse,
  getAllProductsForStore,
  getProducts,
  getRatingStatistics,
  getShippingDetails,
  retrieveProductDetails,
} from "@/queries/product";
import {
  getStoreDefaultShippingDetails,
  getStoreShippingRates,
} from "@/queries/store";
import { getAllSubCategories } from "@/queries/subCategory";
import { Prisma } from "@prisma/client";
import countires from "@/data/countries.json";

export interface DashboardSidebarMenuInterface {
  label: string;
  icon: string;
  link: string;
}

export type SubCategoryWithCategoryType = Awaited<
  ReturnType<typeof getAllSubCategories>
>[0];

// Product + Variant

export type ProductWithVariantType = {
  productId: string;
  variantId: string;
  name: string;
  description: string;
  variantName: string;
  variantDescription: string;
  variantImage: string;
  images: { url: string }[];
  categoryId: string;
  subCategoryId: string;
  isSale: boolean;
  saleEndDate?: string;
  brand: string;
  sku: string;
  weight: number;
  colors: { color: string }[];
  sizes: {
    size: string;
    quantity: number;
    price: number;
    discount: number;
  }[];
  product_specs: {
    name: string;
    value: string;
  }[];
  variant_specs: {
    name: string;
    value: string;
  }[];
  keywords: string[];
  questions: { question: string; answer: string }[];
  createdAt: Date;
  updatedAt: Date;
};

//STORE PRODUCT

export type StoreProductType = Awaited<
  ReturnType<typeof getAllProductsForStore>
>[0];

//STORE DEFAULT SHIPPING DETAILS
export type StoreDefaultShippingType = Awaited<
  ReturnType<typeof getStoreDefaultShippingDetails>
>;
//SHIPPING Rate
// export type CountryWithShippingRatesType = Awaited<
//   ReturnType<typeof getStoreShippingRates>
// >[0];

export type CountryWithShippingRatesType = {
  countryId: string;
  countryName: string;
  shippingRate: ShippingRate;
};

export interface Country {
  name: string;
  code: string;
  city: string;
  region: string;
}

export type SelectMenuOption = (typeof countires)[number];

//STORE DEFAULT SHIPPING DETAILS
export type ProductType = Awaited<
  ReturnType<typeof getProducts>
>["products"][0];

export type VariantSimplified = {
  variantId: string;
  variantSlug: string;
  variantName: string;
  images: ProductVariantImage[];
  sizes: Size[];
};

export type VariantImageType = {
  url: string;
  image: string;
};

export type ProductPageType = Awaited<
  ReturnType<typeof retrieveProductDetails>
>;
export type ProductPageDataType = Awaited<
  ReturnType<typeof formatProductResponse>
>;
export type ProductShippingDetailsType = Awaited<
  ReturnType<typeof getShippingDetails>
>;

export type FreeShippingWithCountriesType = FreeShipping & {
  eligibleCountries: FreeShippingCountry[];
};

export type CartProductType = {
  productId: string;
  variantId: string;
  productSlug: string;
  variantSlug: string;
  name: string;
  variantName: string;
  image: string;
  variantImage: string;
  sizeId: string;
  size: string;
  quantity: number;
  price: number;
  stock: number;
  weight: number;
  shippingMethod: string;
  shippingService: string;
  shippingFee: number;
  extraShippingFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isFreeShipping: boolean;
};

export type RatingStatisticsType = Awaited<
  ReturnType<typeof getRatingStatistics>
>;
export type StatisticsCardType = Awaited<
  ReturnType<typeof getRatingStatistics>
>["ratingStatistics"];

export type ReviewWithImageType = Review & {
  images: ReviewImage[];
  user: User;
};

// Define a local SortOrder type
export type SortOrder = "asc" | "desc";

export type ReviewsFilterType = {
  rating?: number;
  hasImages?: boolean;
};

export type ReviewsOrdereType = {
  orderBy: "latest" | "oldest" | "highest";
};

export type VariantInfoType = {
  variantName: string;
  variantSlug: string;
  variantImage: string;
  variantUrl: string;
  images: ProductVariantImage[];
  sizes: Size[];
  colors: { name: string }[];
};

export type ReviewDetailsType = {
  id: string;
  review: string;
  rating: number;
  images: { url: string }[];
  size: string;
  quantity: string;
  variant: string;
  variantImage: string;
  color: string;
};

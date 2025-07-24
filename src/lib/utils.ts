import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ColorThief from "colorthief";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { db } from "./db";
import { CartProductType, Country } from "./types";
import countries from "@/data/countries.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//helper function to grid classname depending on length

export const getGridClassName = (length: number) => {
  switch (length) {
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-2 grid-rows-2";
    case 4:
      return "grid-cols-2 grid-rows-1";
    case 5:
      return "grid-cols-2 grid-rows-6";
    case 6:
      return "grid-cols-2";
    default:
      return "";
  }
};

// Function to get prominent colors from an image
export const getDominantColors = (imgUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 4).map((color) => {
          // Convert RGB array to hex string
          return `#${((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2])
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
        });
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

// Helper function to genererate a unique slug

// import { PrismaClient } from '@prisma/client';
// import  slugify  from 'slugify';

/**
 * Generates a unique slug by checking the database.
 * @param base - The base string to slugify.
 * @param model - The model name as a lowercase string (e.g. "post").
 * @param field - The field in the model that holds the slug (default: "slug").
 * @returns A unique slug.
 */
export async function generateUniqueSlug(
  base: string,
  model: typeof PrismaClient.ModelName,
  field: string = "slug"
): Promise<string> {
  let slug = slugify(base, { lower: true, strict: true, trim: true });
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const exists = await (db[model] as any).findUnique({
      where: {
        [field]: uniqueSlug,
      },
    });

    if (!exists) {
      break;
    }

    uniqueSlug = `${slug}-${counter++}`;
  }

  return uniqueSlug;
}

// the helper function to get the user country
// Define the default country
const DEFAULT_COUNTRY: Country = {
  name: "United States",
  code: "US",
  city: "",
  region: "",
};

export async function getUserCountry(): Promise<Country> {
  let userCountry: Country = DEFAULT_COUNTRY;
  try {
    //Attempt to detect the country by IP

    const response = await fetch(
      `https://ipinfo.io/?token=${process.env.IPINFO_TOKEN}`
    );
    if (response.ok) {
      const data = await response.json();
      userCountry = {
        name:
          countries.find((c) => c.code === data.country)?.name || data.country,
        code: data.country,
        city: data.city,
        region: data.region,
      };
    }
  } catch (error) {
    console.log("Failed to fetch iP info", error);
  }

  return userCountry;
}

/**
 * Function: getShippingDatesRange
 * Description: Returns the shipping date range by adding the specified min and max days to the current date.
 * Parameters:
 *    - minDays: Minimum number of days to add to the current date.
 *    - maxDays: Maximum number of days to add to the current date.
 * Returns: Object containing minDate and maxDate.
 */

export function getShippingDatesRange(
  minDays: number,
  maxDays: number
): { minDate: string; maxDate: string } {
  const today = new Date();

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  return { minDate: minDate.toDateString(), maxDate: maxDate.toDateString() };
}

// Function to validate the product data before adding it to the cart
export const isProductValidToAdd = (product: CartProductType): boolean => {
  // Check that all required fields are filled
  const {
    productId,
    variantId,
    productSlug,
    variantSlug,
    name,
    variantName,
    image,
    quantity,
    price,
    sizeId,
    size,
    stock,
    shippingFee,
    extraShippingFee,
    shippingMethod,
    shippingService,
    variantImage,
    weight,
    deliveryTimeMin,
    deliveryTimeMax,
  } = product;

  // Ensure that all necessary fields have values
  if (
    !productId ||
    !variantId ||
    !productSlug ||
    !variantSlug ||
    !name ||
    !variantName ||
    !image ||
    quantity <= 0 ||
    price <= 0 ||
    !sizeId || // Ensure sizeId is not empty
    !size || // Ensure size is not empty
    stock <= 0 ||
    weight <= 0 || // Weight should be <= 0
    !shippingMethod ||
    !variantImage ||
    deliveryTimeMin < 0 ||
    deliveryTimeMax < deliveryTimeMin // Ensure delivery times are valid
  ) {
    return false; // Validation failed
  }

  return true; // Product is valid
};

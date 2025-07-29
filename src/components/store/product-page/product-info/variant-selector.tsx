import { ProductVariantImage } from "@/generated/prisma";
import { VariantInfoType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, FC, SetStateAction } from "react";

interface Props {
  variansts: VariantInfoType[];
  slug: string;
  setVariantImages: Dispatch<SetStateAction<ProductVariantImage[]>>;
  setActiveImage: Dispatch<SetStateAction<ProductVariantImage | null>>;
}

const ProductVariantSelector: FC<Props> = ({
  variansts,
  slug,
  setVariantImages,
  setActiveImage,
}) => {
  return (
    <div className='flex items-center flex-wrap gap-2'>
      {variansts.map((variant, i) => (
        <Link
          href={variant.variantUrl}
          key={i}
          onMouseEnter={() => {
            setVariantImages(variant.images);
            setActiveImage(variant.images[0]);
          }}
          onMouseLeave={() => {
            setVariantImages([]);
            setActiveImage(null);
          }}
        >
          <div
            className={cn(
              "w-12 h-12 max-h-12 rounded-full grid place-items-center overflow-hidden outline-[1px] outline-transparent outline-dashed outline-offset-2 cursor-pointer transition-all duration-75 ease-in",
              {
                "outline-main-primary": slug === variant.variantSlug,
              }
            )}
          >
            <Image
              src={variant.variantImage}
              alt={`product variant ${variant.variantUrl}`}
              width={60}
              height={60}
              className='w-12 h-12 rounded-full object-cover object-center'
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductVariantSelector;

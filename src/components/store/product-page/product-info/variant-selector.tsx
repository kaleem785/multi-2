import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface Variant {
  url: string;
  img: string;
  slug: string;
}

interface Props {
  variansts: Variant[];
  slug: string;
}

const ProductVariantSelector: FC<Props> = ({ variansts, slug }) => {
  return (
    <div className='flex items-center flex-wrap gap-2'>
      {variansts.map((variant, i) => (
        <Link href={variant.url} key={i}>
          <div
            className={cn(
              "w-12 h-12 max-h-12 rounded-full grid place-items-center overflow-hidden outline-[1px] outline-transparent outline-dashed outline-offset-2 cursor-pointer transition-all duration-75 ease-in",
              {
                "outline-main-primary": slug === variant.slug,
              }
            )}
          >
            <Image
              src={variant.img}
              alt={`product variant `}
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

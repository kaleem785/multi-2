import { Size } from "@/generated/prisma";
import { CartProductType } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect } from "react";

interface Props {
  sizes: Size[];
  sizeId: string | undefined;
  handleChange: (property: keyof CartProductType, value: any) => void;
}

const SizeSelector: FC<Props> = ({ sizes, sizeId, handleChange }) => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  useEffect(() => {
    if (sizeId) {
      const search_size = sizes.find((s) => s.id === sizeId);
      if (search_size) {
        handleCartProductToBeAddeChange(search_size);
      }
    }
  }, [sizeId]);

  const handleSelectSize = (size: Size) => {
    params.set("size", size.id);
    handleCartProductToBeAddeChange(size);
    replace(`${pathname}?${params.toString()}`);
  };
  const handleCartProductToBeAddeChange = (size: Size) => {
    handleChange("sizeId", sizeId);
    handleChange("size", size.size);
  };
  return (
    <div className='flex flex-wrap gap-4'>
      {sizes.map((size) => (
        <span
          key={size.size}
          className='border rounded-full px-5 cursor-pointer hover:border-black'
          style={{ borderColor: size.id === sizeId ? "#000" : "" }}
          onClick={() => handleSelectSize(size)}
        >
          {size.size}
        </span>
      ))}
    </div>
  );
};

export default SizeSelector;

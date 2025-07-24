import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import NoImageImg from "../../../../public/assets/images/no_image_2.png";
import Image from "next/image";
import { cn, getDominantColors, getGridClassName } from "@/lib/utils";
import { Trash } from "lucide-react";
import { promise } from "zod";
import ColorPalette from "./color-palette";

interface ImagesPreviewGridProps {
  images: { url: string }[];
  onRemove: (value: string) => void;
  colors: { color: string }[];
  setColors: Dispatch<SetStateAction<{ color: string }[]>>;
}

const ImagesPreviewGrid: FC<ImagesPreviewGridProps> = ({
  images,
  onRemove,
  colors,
  setColors,
}) => {
  let imagesLength = images.length;

  //Get the grid class name base on the number of images
  const GridClassName = getGridClassName(imagesLength);

  //Extract images colors

  const [colorPalettes, setColorPaltettes] = useState<string[][]>([]);

  useEffect(() => {
    const fetchColors = async () => {
      const palettes = await Promise.all(
        images.map(async (img) => {
          try {
            const colors = await getDominantColors(img.url);
            return colors;
          } catch (error) {
            return [];
          }
        })
      );
      setColorPaltettes(palettes);
    };
    if (imagesLength > 0) {
      fetchColors();
    }
  }, [images]);

  console.log("colorPalette...>", colorPalettes);

  if (imagesLength === 0) {
    return (
      <div>
        <Image
          src={NoImageImg}
          alt='No images available'
          width={500}
          height={600}
          className='rounded-md'
        />
      </div>
    );
  } else {
  }
  return (
    <div className='max-w-4xl '>
      <div
        className={cn(
          "grid h-[800px] overflow-hidden bg-white rounded-md",
          GridClassName
        )}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className={cn(
              "relative group h-full w-full border-gray-300",
              `grid_${imagesLength}_image_${i + 1}`,
              {
                "h-[266.66px]": images.length === 6,
              }
            )}
          >
            <Image
              src={img.url}
              alt=''
              width={800}
              height={800}
              className='w-full h-full object-cover object-top'
            />
            {/* Actions*/}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 bottom-0 bg-white/55 cursor-pointer hidden group-hover:flex items-center justify-center flex-col gap-y-3 transition-all duration-500",
                {
                  "!pb-[40%] ": imagesLength === 1,
                }
              )}
            >
              {/* Color palette (Extract colors) */}
              <ColorPalette
                colors={colors}
                setColors={setColors}
                extractedColors={colorPalettes[i]}
              />

              {/* delete button */}
              <button
                className='Btn'
                type='button'
                onClick={() => onRemove(img.url)}
              >
                <div className='sign'>
                  <Trash />
                </div>
                <div className='text'>Delete</div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagesPreviewGrid;

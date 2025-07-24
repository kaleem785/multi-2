import { ProductVariantImage } from "@/generated/prisma";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import { Autoplay } from "swiper/modules";
import Image from "next/image";
import "swiper/css";

export default function ProductCardImageSwiper({
  images,
}: {
  images: ProductVariantImage[];
}) {
  const swiperRef = useRef<any>(null); // store Swiper instance

  const handleMouseEnter = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  const handleMouseLeave = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.stop();
      swiperRef.current.slideTo(0);
    }
  };

  return (
    <div
      className='relative mb-2 w-full h-[200px] bg-white contrast-[90%] rounded-2xl overflow-hidden'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 500 }}
        loop={true}
        onSwiper={(swiper) => {
          swiper.autoplay.stop();
          swiperRef.current = swiper;
        }}
      >
        {images.map((img) => (
          <SwiperSlide key={img.id}>
            <Image
              src={img.url}
              alt=''
              width={400}
              height={400}
              className='block object-cover h-[200px] w-48 sm:w-52'
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// declare module "color-thief" {
//   export default class ColorThief {
//     getColor(img: HTMLImageElement, quality?: number): [number, number, number];
//     getPalette(
//       img: HTMLImageElement,
//       colorCount?: number,
//       quality?: number
//     ): [number, number, number][];
//   }
// }

// /types/colorthief.d.ts
declare module "colorthief" {
  interface ColorThief {
    getColor(image: HTMLImageElement | string, quality?: number): number[];
    getPalette(
      image: HTMLImageElement | string,
      colorCount?: number,
      quality?: number
    ): number[][];
  }

  const ColorThief: {
    new (): ColorThief;
  };

  export default ColorThief;
}

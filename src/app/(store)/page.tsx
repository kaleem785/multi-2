import ThemeToggle from "@/components/shared/theme-toggle";
import ProductList from "@/components/store/shared/product-list";
import { Button } from "@/components/ui/button";
import { getUserCountry } from "@/lib/utils";
import { updateVariantImage } from "@/migration-scripts/migrate-variantImage";
import { seedCountries } from "@/migration-scripts/seed-countries";
import { getProducts } from "@/queries/product";
import { UserButton } from "@clerk/nextjs";

export default async function HomePage() {
  const productsData = await getProducts();
  const { products } = productsData;
  return (
    <div className='p-14'>
      <ProductList products={products} title='Products' arrow />
    </div>
  );
}

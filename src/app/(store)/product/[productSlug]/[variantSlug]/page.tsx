import StoreCard from "@/components/store/cards/store-card";
import ProductPageContainer from "@/components/store/product-page/container";
import ProductDescription from "@/components/store/product-page/product-description";
import ProductQuestions from "@/components/store/product-page/product-questions";
import ProductSpecs from "@/components/store/product-page/product-specs";
import RelatedProducts from "@/components/store/product-page/related-product";
import ProductReviews from "@/components/store/product-page/reviews/product-reviews";
import StoreProducts from "@/components/store/product-page/store-products";
import { Separator } from "@/components/ui/separator";
import { getProductPageData, getProducts } from "@/queries/product";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    productSlug: string;
    variantSlug: string;
  };
  searchParams: {
    size?: string;
  };
}
export default async function ProductVariantPage({
  params,
  searchParams,
}: PageProps) {
  const { productSlug, variantSlug } = params;
  const { size: sizeId } = searchParams;
  //fetch product data based on the product slug and variant slug
  const productData = await getProductPageData(productSlug, variantSlug);
  if (!productData) {
    return notFound();
  }

  //Extract the available sizes for the product variant
  const { sizes } = productData;

  //if the size is provided in the url
  if (sizeId) {
    // check if the provided sizeId is valid by comparing with available sizes
    const isValidSize = sizes.some((size) => size.id === sizeId);
    // if the sizeId is not valid, redirect to the same page without the size parameter
    if (!isValidSize) {
      return redirect(`/product/${productSlug}/${variantSlug}`);
    }
  } else if (sizes.length === 1) {
    return redirect(
      `/product/${productSlug}/${variantSlug}?size=${sizes[0].id}`
    );
  }

  const {
    specs,
    questions,
    shippingDetails,
    category,
    subCategory,
    store,
    reviewStatistics,
  } = productData;

  const relatedProducts = await getProducts(
    { category: category.url },
    "",
    1,
    12
  );
  // console.log(relatedProducts, "related products");

  return (
    <div>
      <div className='max-w-[1650px] mx-auto p-4 overflow-x-hidden'>
        <ProductPageContainer productData={productData} sizeId={sizeId}>
          {relatedProducts.products && (
            <>
              <Separator />
              {/* Related products */}
              <RelatedProducts products={relatedProducts.products} />
            </>
          )}
          <Separator className='mt-6' />
          {/* Product Review */}
          <ProductReviews
            productId={productData.productId}
            rating={productData.rating}
            statistics={reviewStatistics}
          />
          <>
            <Separator className='mt-6' />
            {/* Product description */}
            <ProductDescription
              text={[
                productData.description,
                productData.variantDescription || "",
              ]}
            />
          </>
          {(specs.product.length > 0 || specs.variant.length > 0) && (
            <>
              <Separator className='mt-6' />
              {/* Specs table */}
              <ProductSpecs specs={specs} />
            </>
          )}
          {questions.length > 0 && (
            <>
              <Separator className='mt-6' />
              {/*Product Questions */}
              <ProductQuestions questions={questions} />
            </>
          )}
          <Separator className='mt-6' />
          {/* Store Card */}
          <StoreCard store={productData.store} />
          {/* Store Product */}
          <StoreProducts
            storeUrl={store.url}
            storeName={store.name}
            count={5}
          />
        </ProductPageContainer>
      </div>
    </div>
  );
}

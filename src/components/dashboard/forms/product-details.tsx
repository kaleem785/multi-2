"use client";
import { Category, Store, SubCategory } from "@/generated/prisma";
import { ProductFormSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUpload from "../shared/image-upload";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import * as z from "zod";
import { useEffect, useRef, useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import { Textarea } from "@/components/ui/textarea";
import { upsertProduct } from "@/queries/product";
import { ProductWithVariantType } from "@/lib/types";
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllsubCategoriesForCategory } from "@/queries/category";

//ReactTags
import { WithOutContext as ReactTags } from "react-tag-input";
//React datetime picker
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import JoditEditor from "jodit-react";

import { format, set } from "date-fns";
import { NumberInput } from "@tremor/react";

interface ProductDetailsProps {
  data?: Partial<ProductWithVariantType>;

  categories: Category[];
  storeUrl: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  data,
  categories,
  storeUrl,
}) => {
  const router = useRouter();
  const { setClose } = useModal();

  //jodit editor ref
  const productDescriptionRef = useRef(null);
  const variantDescriptionRef = useRef(null);

  const [subCategories, setSubCategoris] = useState<SubCategory[]>([]);
  const [images, setImages] = useState<{ url: string }[]>([]);
  const [colors, setColors] = useState<{ color: string }[]>([{ color: "" }]);
  const [sizes, setSizes] = useState<
    { size: string; price: number; quantity: number; discount: number }[]
  >(data?.sizes || [{ size: "", quantity: 1, price: 0.01, discount: 0 }]);
  const [productSpecs, setProductSpecs] = useState<
    { name: string; value: string }[]
  >(data?.product_specs || [{ name: "", value: "" }]);
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(data?.product_specs || [{ name: "", value: "" }]);
  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >(data?.questions || [{ question: "", answer: "" }]);

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: data?.name,
      description: data?.description,
      variantName: data?.variantName,
      variantDescription: data?.variantDescription,
      images: data?.images || [],
      variantImage: data?.variantImage ? [{ url: data.variantImage }] : [],
      categoryId: data?.categoryId,
      subCategoryId: data?.subCategoryId,
      brand: data?.brand,
      sku: data?.sku,
      colors: data?.colors || [{ color: "" }],
      sizes: data?.sizes,
      product_specs: data?.product_specs || [],
      variant_specs: data?.variant_specs || [],
      keywords: data?.keywords,
      questions: data?.questions || [],
      isSale: data?.isSale,
      weight: data?.weight,
      saleEndDate:
        data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    },
  });

  useEffect(() => {
    const getSubCategories = async () => {
      const res = await getAllsubCategoriesForCategory(form.watch().categoryId);
      setSubCategoris(res);
    };
    getSubCategories();
  }, [form.watch().categoryId]);

  // Extract errors state from form
  const errors = form.formState.errors;

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset({ ...data, variantImage: [{ url: data.variantImage }] });
    }
  }, [data, form]);

  const handleSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
    try {
      // Handle form submission logic here
      console.log("Form submitted with values:", values);
      //Upserting category data
      const response = await upsertProduct(
        {
          productId: data?.productId ? data.productId : v4(),
          variantId: data?.variantId ? data.variantId : v4(),
          name: values.name,
          description: values.description,
          variantName: values.variantName,
          variantDescription: values.variantDescription ?? "",
          images: values.images,
          variantImage: values.variantImage[0]?.url || "",
          categoryId: values.categoryId,
          subCategoryId: values.subCategoryId,
          isSale: values.isSale,
          saleEndDate: values.isSale
            ? values.saleEndDate
            : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
          product_specs: values.product_specs,
          variant_specs: values.variant_specs,
          brand: values.brand,
          sku: values.sku,
          weight: values.weight,
          colors: values.colors || [],
          sizes: values.sizes || [],
          keywords: values.keywords,
          questions: values.questions,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        storeUrl
      );
      console.log(response, "response");
      toast.success(
        data?.productId && data?.variantId
          ? "Product updated successfully!"
          : `Congratulation! product ${response.slug} is now created`
      );
      if (data?.productId && data?.variantId) {
        router.refresh();
      } else {
        router.push(`/dashboard/seller/stores/${storeUrl}/products`);
      }
      setClose();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(`${error.toString()}`);
    }
  };

  //Handle keywords input
  const [keywords, setKeywords] = useState<string[]>([]);

  interface Keyword {
    id: string;
    text: string;
  }

  const handleAddingKeyword = (keyword: Keyword) => {
    if (keyword.text.trim() === "") return;
    if (keywords.length === 10) return;
    setKeywords((prev) => [...prev, keyword.text]);
  };
  const handleRemovingKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    form.setValue("colors", colors);
    form.setValue("sizes", sizes);
    form.setValue("keywords", keywords);
    form.setValue("product_specs", productSpecs);
    form.setValue("variant_specs", variantSpecs);
  }, [colors, sizes, productSpecs, variantSpecs, keywords, data]);

  console.log(form.getValues(), "form values 1111");

  return (
    <AlertDialog>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            {data?.productId && data.variantId
              ? `Update ${data?.name} product information.`
              : " Lets create a product. You can edit product later from the product page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              {/* images - colors */}
              <div className='flex flex-col gap-y-6 xl:flex-row'>
                {/* images */}

                <FormField
                  control={form.control}
                  name='images'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <>
                          <ImagesPreviewGrid
                            images={form.getValues().images}
                            onRemove={(url) => {
                              const updatedImages = images.filter(
                                (img) => img.url !== url
                              );
                              setImages(updatedImages);
                              field.onChange(updatedImages);
                            }}
                            colors={colors}
                            setColors={setColors}
                          />
                          <FormMessage />

                          <ImageUpload
                            dontShowPreview
                            type='standard'
                            value={field.value.map((image) => image.url)}
                            disabled={isLoading}
                            onChange={(url) =>
                              setImages((prevImages) => {
                                const updatedImages = [...prevImages, { url }];
                                field.onChange(updatedImages);
                                return updatedImages;
                              })
                            }
                            onRemove={(url) =>
                              field.onChange([
                                ...field.value.filter(
                                  (current) => current.url !== url
                                ),
                              ])
                            }
                          />
                        </>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Colors */}
                <div className='w-full flex flex-col gap-y-3 xl:pl-5'>
                  <ClickToAddInputs
                    details={colors}
                    setDetails={setColors}
                    initialDetails={{ color: "" }}
                    header='Colors'
                    colorPicker={true}
                  />
                  {errors.colors && (
                    <span className='text-sm font-medium text-destructive'>
                      {errors.colors.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className='flex flex-col gap-4 xl:flex-row'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Product name</FormLabel>
                      <FormControl>
                        <Input placeholder='Name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='variantName'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Variant name</FormLabel>
                      <FormControl>
                        <Input placeholder='Name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Product and variant description editors */}
              <Tabs defaultValue='product' className='w-full'>
                <TabsList className='w-full grid grid-cols-2'>
                  <TabsTrigger value='product'>Product description</TabsTrigger>
                  <TabsTrigger value='variant'>Variant description</TabsTrigger>
                </TabsList>
                <TabsContent value='product'>
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormControl>
                          <JoditEditor
                            ref={productDescriptionRef}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value='variant'>
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name='variantDescription'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>Variant description</FormLabel>
                        <FormControl>
                          <JoditEditor
                            ref={variantDescriptionRef}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              {/* Category - SubCategory */}
              <div className='flex flex-col xl:flex-row gap-4'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='categoryId'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Product Category</FormLabel>
                      <Select
                        disabled={isLoading || categories.length == 0}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              defaultValue={field.value}
                              placeholder='Select a category'
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch().categoryId && (
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name='subCategoryId'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>Product SubCategory</FormLabel>
                        <Select
                          disabled={isLoading || categories.length == 0}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder='Select a category'
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subCategories.map((sb) => (
                              <SelectItem key={sb.id} value={sb.id}>
                                {sb.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Brand , Sku , Weight*/}

              <div className='flex flex-col xl:flex-row gap-4'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='brand'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Product Brand</FormLabel>
                      <FormControl>
                        <Input placeholder='Brand' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='sku'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Product Sku</FormLabel>
                      <FormControl>
                        <Input placeholder='Sku' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='weight'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Product weight</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Product weight'
                          min={0.01}
                          step={0.01}
                          className='!shadow-none rounded-md !text-sm'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Variant Image - Keywords */}
              <div className='flex items-center gap-10 py-14'>
                {/* Variant Image */}
                <div className='border-r pr-10'>
                  <FormField
                    control={form.control}
                    name='variantImage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='ml-14'>Variant Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            dontShowPreview
                            type='profile'
                            value={field.value.map((image) => image.url)}
                            disabled={isLoading}
                            onChange={(url) => field.onChange([{ url }])}
                            onRemove={(url) =>
                              field.onChange([
                                ...field.value.filter(
                                  (current) => current.url !== url
                                ),
                              ])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/*Keywords */}
                <div className='w-full flex-1 space-y-3'>
                  <FormField
                    control={form.control}
                    name='keywords'
                    render={({ field }) => (
                      <FormItem className='relative flex-1'>
                        <FormLabel>Product Keywords</FormLabel>
                        <FormControl>
                          <ReactTags
                            handleAddition={handleAddingKeyword}
                            handleDelete={() => {}}
                            placeholder='Keywords (e.g., winter jacker, warm, stylish)'
                            classNames={{
                              tagInputField:
                                "bg-background border rounded-md p-2 w-full focus:outline-none",
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex flex-wrap gap-1'>
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className='bg-blue-200 text-blue-700 text-sm font-medium px-3 py-1 rounded-full'
                      >
                        {keyword}
                        <button
                          type='button'
                          className='ml-1 cursor-pointer'
                          onClick={() => handleRemovingKeyword(index)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div className='w-full flex flex-col gap-y-3'>
                <ClickToAddInputs
                  details={sizes}
                  setDetails={setSizes}
                  initialDetails={{
                    size: "",
                    quantity: 1,
                    price: 0.01,
                    discount: 0,
                  }}
                  header='Sizes , Quantities, Prices, Discount'
                />
                {errors.sizes && (
                  <span className='text-sm font-medium text-destructive'>
                    {errors.sizes.message}
                  </span>
                )}
              </div>
              {/* Product and Variant Specs */}
              <Tabs defaultValue='productSpecs' className='w-full'>
                <TabsList className='w-full grid grid-cols-2'>
                  <TabsTrigger value='productSpecs'>
                    Product Specifications
                  </TabsTrigger>
                  <TabsTrigger value='variantSpecs'>
                    Variant Specifications
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='productSpecs'>
                  <div className='w-full flex flex-col gap-y-3'>
                    <ClickToAddInputs
                      details={productSpecs}
                      setDetails={setProductSpecs}
                      initialDetails={{
                        name: "",
                        value: "",
                      }}
                    />
                    {errors.product_specs && (
                      <span className='text-sm font-medium text-destructive'>
                        {errors.product_specs.message}
                      </span>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value='variantSpecs'>
                  <div className='w-full flex flex-col gap-y-3'>
                    <ClickToAddInputs
                      details={variantSpecs}
                      setDetails={setVariantSpecs}
                      initialDetails={{
                        name: "",
                        value: "",
                      }}
                    />
                    {errors.variant_specs && (
                      <span className='text-sm font-medium text-destructive'>
                        {errors.variant_specs.message}
                      </span>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Question */}
              <div className='w-full flex flex-col gap-y-3'>
                <ClickToAddInputs
                  details={questions}
                  setDetails={setQuestions}
                  initialDetails={{
                    question: "",
                    answer: "",
                  }}
                  header='Qesution & Answer'
                />
                {errors.questions && (
                  <span className='text-sm font-medium text-destructive'>
                    {errors.questions.message}
                  </span>
                )}
              </div>

              {/* Is on sale */}
              <div className='flex rounded-md border'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='isSale'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>On Sale</FormLabel>
                        <FormDescription>
                          This Category will appear on the home page.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {form.getValues().isSale && (
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name='saleEndDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 p-4'>
                        <FormControl>
                          <DateTimePicker
                            onChange={(date) =>
                              field.onChange(
                                date
                                  ? format(date, "yyyy-MM-dd'T'HH:mm:ss")
                                  : ""
                              )
                            }
                            value={field.value ? new Date(field.value) : null}
                            className='w-full'
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.productId && data.variantId
                  ? "Save Store information"
                  : "Create store"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default ProductDetails;

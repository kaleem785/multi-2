"use client";
import { Category } from "@/generated/prisma";
import { CategoryFormSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUpload from "../shared/image-upload";
import { v4 } from "uuid";
import { toast } from "react-toastify";

import * as z from "zod";
import { useEffect } from "react";
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
import { upsertCategory } from "@/queries/category";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import { fi } from "date-fns/locale";

interface CategoryDetailsProps {
  data?: Category;
}

const CategoryDetails: React.FC<CategoryDetailsProps> = ({ data }) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: data?.name || "",
      image: data?.image ? [{ url: data.image }] : [{ url: "" }],
      url: data?.url || "",
      featured: data?.featured || false,
    },
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
        image: [{ url: data?.image }],
        url: data?.url,
        featured: data?.featured || false,
      });
    }
  }, [form, data]);

  const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
    try {
      // Handle form submission logic here
      //Upserting category data
      const response = await upsertCategory({
        id: data?.id ? data.id : v4(),
        name: values.name,
        image: values.image[0].url,
        url: values.url,
        featured: values.featured,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success(
        data?.id
          ? "Category updated successfully!"
          : "Category created successfully!"
      );
      if (data?.id) {
        router.refresh();
      } else {
        router.push("/dashboard/admin/categories");
      }
      setClose();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(`${error.toString()}`);
    }
  };

  return (
    <AlertDialog>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.name} category information.`
              : " Lets create a category. You can edit category later from the categories table or the category page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
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
              <FormField
                disabled={isLoading}
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Category name</FormLabel>
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
                name='url'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Category url</FormLabel>
                    <FormControl>
                      <Input placeholder='/Category-url' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name='featured'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border py-4'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        This Category will appear on the home page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.id
                  ? "Save category information"
                  : "Create category"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default CategoryDetails;

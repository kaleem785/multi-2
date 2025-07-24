"use client";
import { Store } from "@/generated/prisma";
import { StoreFormSchema } from "@/lib/schemas";
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
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import { Textarea } from "@/components/ui/textarea";
import { upsertStore } from "@/queries/store";

interface StoreDetailsProps {
  data?: Store;
}

const StoreDetails: React.FC<StoreDetailsProps> = ({ data }) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<z.infer<typeof StoreFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(StoreFormSchema),
    defaultValues: {
      name: data?.name,
      description: data?.description,
      email: data?.email,
      phone: data?.phone,
      logo: data?.logo ? [{ url: data?.logo }] : [],
      cover: data?.cover ? [{ url: data?.cover }] : [],
      url: data?.url,
      featured: data?.featured,
      status: data?.status.toString(),
    },
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
        description: data.description,
        email: data?.email,
        phone: data?.phone,
        logo: [{ url: data?.logo }],
        cover: [{ url: data?.cover }],
        url: data?.url,
        featured: data?.featured,
        status: data?.status,
      });
    }
  }, [form, data]);

  const handleSubmit = async (values: z.infer<typeof StoreFormSchema>) => {
    try {
      // Handle form submission logic here
      //Upserting category data
      const response = await upsertStore({
        id: data?.id ? data.id : v4(),
        name: values.name,
        description: values?.description,
        email: values?.email,
        phone: values?.phone,
        logo: values.logo[0].url,
        cover: values.cover[0].url,
        url: values.url,
        featured: values.featured,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(response, "response");
      toast.success(
        data?.id
          ? "Category updated successfully!"
          : "Category created successfully!"
      );
      if (data?.id) {
        router.refresh();
      } else {
        router.push(`/dashboard/seller/stores/${response?.url}`);
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
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.name} store information.`
              : " Lets create a store. You can edit store later from the store setting page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              {/* Logo - Cover */}
              <div className='relative py-2 mb-24'>
                <FormField
                  control={form.control}
                  name='logo'
                  render={({ field }) => (
                    <FormItem className='absolute -bottom-20 -left-48 z-10 inset-x-96'>
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
                  control={form.control}
                  name='cover'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          type='cover'
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
              <FormField
                disabled={isLoading}
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Store name</FormLabel>
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
                name='description'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Store description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-col gap-6 md:flex-row'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Store email</FormLabel>
                      <FormControl>
                        <Input placeholder='Email' {...field} type='email' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Store phone</FormLabel>
                      <FormControl>
                        <Input placeholder='Phone' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name='url'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Store url</FormLabel>
                    <FormControl>
                      <Input placeholder='/store-url' {...field} />
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
                        This Store will appear on the home page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.id
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

export default StoreDetails;

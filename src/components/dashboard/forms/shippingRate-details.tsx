"use client";
import { ShippingRateFormSchema } from "@/lib/schemas";
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
import { upsertShippingRate } from "@/queries/store";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import { CountryWithShippingRatesType } from "@/lib/types";
import { NumberInput } from "@tremor/react";
import { Textarea } from "@/components/ui/textarea";

interface ShippingRateDetailsProps {
  data?: CountryWithShippingRatesType;
  storeUrl: string;
}

const ShippingRateDetails: React.FC<ShippingRateDetailsProps> = ({
  data,
  storeUrl,
}) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<z.infer<typeof ShippingRateFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(ShippingRateFormSchema),
    defaultValues: {
      // Setting default form values from data (if available)
      countryId: data?.countryId,
      countryName: data?.countryName,
      shippingService: data?.shippingRate
        ? data?.shippingRate.shippingService
        : "",
      shippingFeePerItem: data?.shippingRate
        ? data?.shippingRate.shippingFeePerItem
        : 0,
      shippingFeeAdditionalItem: data?.shippingRate
        ? data?.shippingRate.shippingFeeAdditionalItem
        : 0,
      shippingFeePerKg: data?.shippingRate
        ? data?.shippingRate.shippingFeePerKg
        : 0,
      shippingFeeFixed: data?.shippingRate
        ? data?.shippingRate.shippingFeeFixed
        : 0,
      deliveryTimeMin: data?.shippingRate
        ? data?.shippingRate.deliveryTimeMin
        : 1,
      deliveryTimeMax: data?.shippingRate
        ? data?.shippingRate.deliveryTimeMax
        : 1,
      returnPolicy: data?.shippingRate ? data.shippingRate.returnPolicy : "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [form, data]);

  const handleSubmit = async (
    values: z.infer<typeof ShippingRateFormSchema>
  ) => {
    try {
      // Handle form submission logic here
      //Upserting category data
      const response = await upsertShippingRate(storeUrl, {
        id: data?.shippingRate ? data.shippingRate.id : v4(),
        countryId: values?.countryId ? values.countryId : "",
        shippingService: values.shippingService,
        shippingFeePerItem: values.shippingFeePerItem,
        shippingFeeAdditionalItem: values.shippingFeeAdditionalItem,
        shippingFeePerKg: values.shippingFeePerKg,
        shippingFeeFixed: values.shippingFeeFixed,
        deliveryTimeMin: values.deliveryTimeMin,
        deliveryTimeMax: values.deliveryTimeMax,
        createdAt: new Date(),
        updatedAt: new Date(),
        returnPolicy: values.returnPolicy,
        storeId: "",
      });

      if (response.id) {
        toast.success("Shipping rates updated sucessfully !");
        router.refresh();
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
          <CardTitle>Shipping Rate</CardTitle>
          <CardDescription>
            Update Shipping rate information for {data?.countryName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className='hidden'>
                <FormField
                  disabled
                  control={form.control}
                  name='countryId'
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
              </div>
              <div className='space-y-4'>
                <FormField
                  disabled
                  control={form.control}
                  name='countryName'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input placeholder='Country Name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='shippingService'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input placeholder='Shipping Service' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='shippingFeePerItem'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Shipping fee per item</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          step={0.1}
                          min={0}
                          className='pl-1.5 !shadow-none rounded-md'
                          placeholder='Shipping fees per item'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='shippingFeeAdditionalItem'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Shipping fee for additional item</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          step={0.1}
                          min={0}
                          className='pl-1.5 !shadow-none rounded-md'
                          placeholder='Shipping fees for additional item'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='shippingFeePerKg'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Shipping fee per kg</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          step={0.1}
                          min={0}
                          className='pl-1.5 !shadow-none rounded-md'
                          placeholder='Shipping fees per kg'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='shippingFeeFixed'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Fixed Shipping fee</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          step={0.1}
                          min={0}
                          className='pl-1.5 !shadow-none rounded-md'
                          placeholder='Fixed Shipping fees'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='deliveryTimeMin'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Delivery time min </FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={1}
                          className='pl-2 pl-1.5 !shadow-none rounded-md'
                          placeholder='Minimum Delivery time (days)'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='deliveryTimeMax'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Delivery time max </FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={1}
                          className='pl-2 pl-1.5 !shadow-none rounded-md'
                          placeholder='Maximum Delivery time (days)'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='returnPolicy'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Return policy</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="What's the return policy for your store ?"
                          className='p-4'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='mt-4'>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? "loading..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default ShippingRateDetails;

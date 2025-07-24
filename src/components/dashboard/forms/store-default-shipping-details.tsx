"use client";
import { StoreShippingFormSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 } from "uuid";
import { toast } from "react-toastify";

import * as z from "zod";
import { useEffect } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import { StoreDefaultShippingType } from "@/lib/types";

import { NumberInput } from "@tremor/react";
import { Textarea } from "@/components/ui/textarea";
import { updateStoreDefaultShippingDetails } from "@/queries/store";

interface StoreDefaultShippingDetailsProps {
  data?: StoreDefaultShippingType;
  storeUrl: string;
}

const StoreDefaultShippingDetails: React.FC<
  StoreDefaultShippingDetailsProps
> = ({ data, storeUrl }) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<z.infer<typeof StoreShippingFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(StoreShippingFormSchema),
    defaultValues: {
      defaultShippingService: data?.defaultShippingService,
      defaultShippingFeePerItem: data?.defaultShippingFeePerItem,
      defaultShippingFeeAdditionalItem: data?.defaultShippingFeeAdditionalItem,
      defaultShippingFeePerKg: data?.defaultShippingFeePerKg,
      defaultShippingFeeFixed: data?.defaultShippingFeeFixed,
      defaultDeliveryTimeMin: data?.defaultDeliveryTimeMin,
      defaultDeliveryTimeMax: data?.defaultDeliveryTimeMax,
      returnPolicy: data?.returnPolicy,
    },
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [form, data]);

  const handleSubmit = async (
    values: z.infer<typeof StoreShippingFormSchema>
  ) => {
    try {
      // Handle form submission logic here
      //Upserting category data
      const response = await updateStoreDefaultShippingDetails(storeUrl, {
        defaultShippingService: values.defaultShippingService,
        defaultShippingFeePerItem: values.defaultShippingFeePerItem,
        defaultShippingFeeAdditionalItem:
          values.defaultShippingFeeAdditionalItem,
        defaultShippingFeePerKg: values.defaultShippingFeePerKg,
        defaultShippingFeeFixed: values.defaultShippingFeeFixed,
        defaultDeliveryTimeMin: values.defaultDeliveryTimeMin,
        defaultDeliveryTimeMax: values.defaultDeliveryTimeMax,
        returnPolicy: values.returnPolicy,
      });
      if (response.id) {
        toast.success("Store Default shipping details has been updated");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(`${error.toString()}`);
    }
  };

  return (
    <AlertDialog>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Store Default Shipping details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4'
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name='defaultShippingService'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Shipping Service name</FormLabel>
                    <FormControl>
                      <Input placeholder='Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex flex-wrap gap-4'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='defaultShippingFeePerItem'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Shipping fee per item</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className='pl-2 !shadow-none rounded-md'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='defaultShippingFeeAdditionalItem'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Shipping fee for additional item</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className='pl-2 !shadow-none rounded-md'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex flex-wrap gap-4'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='defaultShippingFeePerKg'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Shipping fee per kg</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className='pl-2 !shadow-none rounded-md'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='defaultShippingFeeFixed'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Fixed Shipping fee</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={0}
                          step={0.1}
                          className='pl-2 !shadow-none rounded-md'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex flex-wrap gap-4'>
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='defaultDeliveryTimeMin'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Minumun Delivery time (days)</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={1}
                          className='pl-2 !shadow-none rounded-md'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name='defaultDeliveryTimeMax'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Maximum Delivery time (days)</FormLabel>
                      <FormControl>
                        <NumberInput
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          min={1}
                          className='pl-2 !shadow-none rounded-md'
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
                name='returnPolicy'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Return policy</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        onChange={field.onChange}
                        placeholder="What's the return policy foryour store ?"
                        className='p-4'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' disabled={isLoading}>
                {isLoading ? "loading..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default StoreDefaultShippingDetails;

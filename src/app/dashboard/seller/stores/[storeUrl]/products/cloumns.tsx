"use client";

// React, Next.js imports
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Custom components

// UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks and utilities
// import { useToast } from "@/components/ui/use-toast";
import { toast } from "react-toastify";

// import { useToast } from "@/hooks/use-toast";

import { useModal } from "@/providers/modal-provider";

// Lucide icons
import { CopyPlus, Ellipsis, FilePenLine, Trash } from "lucide-react";

// Queries
import { deleteProduct } from "@/queries/product";

// Tanstack React Table
import { StoreProductType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Prisma models

export const columns: ColumnDef<StoreProductType>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      return (
        <div className='flex flex-col gap-y-3 '>
          <h1 className='font-bold truncate pb-3 border-b capitalize'>
            {row.original.name}
          </h1>
          <div className='relative flex flex-wrap'>
            {row.original.variants.map((variant) => (
              <div key={variant.id} className='flex flex-col gap-y-2 group'>
                <div className='relative cursor-pointer'>
                  <Image
                    src={variant.images[0]?.url}
                    alt={`Image of ${variant.variantName}`}
                    width={1000}
                    height={1000}
                    className='min-w-72 max-w-72 h-80 rounded-sm object-cover shadow-2xl'
                  />
                  <Link
                    href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/${variant.id}`}
                  >
                    <div className='w-full h-full absolute top-0 left-0 bottom-0 right-0 rounded-sm bg-black/50 transition-all duration-150 hidden group-hover:block'>
                      <FilePenLine className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white' />
                    </div>
                  </Link>
                  {/* Variant Info */}
                  <div className='flex m-2 gap-2 p-1'>
                    {/* Colors*/}
                    <div className='w-7 flex flex-col gap-2 rounded-md'>
                      {variant.colors.map((color, index) => (
                        <span
                          key={index}
                          className='w-5 h-5 rounded-full shadow-2xl'
                          style={{ backgroundColor: color.name }}
                        />
                      ))}
                    </div>
                    <div>
                      {/* Name of variant */}
                      <h1 className='max-w-40 capitalize text-sm'>
                        {variant.variantName}
                      </h1>

                      {/* Sizes */}
                      <div className='flex flex-wrap gap-2 max-w-72 mt-1'>
                        {variant.sizes.map((size, index) => (
                          <span
                            key={index}
                            className='w-fit p-1 rounded-md text-[11px] font-medium border-2 bg-white/10'
                          >
                            {size.size} - ({size.quantity}) - ${size.price}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span>{row.original.category.name}</span>;
    },
  },
  {
    accessorKey: "subCategory",
    header: "Sub Category",
    cell: ({ row }) => {
      return <span>{row.original.subCategory.name}</span>;
    },
  },

  {
    accessorKey: "new-variant",
    header: "",
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/new`}
        >
          <CopyPlus className='hover:text-blue-200' />
        </Link>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;

      return <CellActions productId={rowData.id} />;
    },
  },
];

// Define props interface for CellActions component
interface CellActionsProps {
  productId: string;
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ productId }) => {
  // Hooks
  const { setClose } = useModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Return null if rowData or rowData.id don't exist
  if (!productId) return null;

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <Ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className='flex gap-2' onClick={() => {}}>
              <Trash size={15} /> Delete product
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className='max-w-lg'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-left'>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-left'>
            This action cannot be undone. This will permanently delete the
            product and variant exist inside product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex items-center'>
          <AlertDialogCancel className='mb-2'>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className='bg-destructive hover:bg-destructive mb-2 text-white'
            onClick={async () => {
              setLoading(true);
              await deleteProduct(productId);
              toast.success("Category deleted successfully");
              setLoading(false);
              router.refresh();
              setClose();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

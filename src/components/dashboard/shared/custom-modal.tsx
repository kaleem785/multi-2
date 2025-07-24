"use client";

// Provider
import { useModal } from "@/providers/modal-provider";

// UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type Props = {
  heading?: string;
  subheading?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  maxWidth?: string;
};

const CustomModal = ({
  children,
  defaultOpen,
  subheading,
  heading,
  maxWidth,
}: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog modal={false} open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        className={cn(
          "Z-[999] overflow-y-scroll md:max-h-[700px] md:h-fit h-screen bg-card",
          maxWidth
        )}
      >
        <DialogHeader className='pt-8 text-left'>
          {heading && (
            <DialogTitle className='text-2xl font-bold'>{heading}</DialogTitle>
          )}
          {subheading && <DialogDescription>{subheading}</DialogDescription>}
        </DialogHeader>
        <div> {children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;

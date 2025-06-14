import ThemeToggle from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className='p-5'>
      <div className='w-100 gap-x-5 flex justify-end'>
        <UserButton />
        <ThemeToggle />
      </div>
      <h1 className='text-blue-500'>Home page</h1>
    </div>
  );
}

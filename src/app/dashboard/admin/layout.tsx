import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user?.privateMetadata?.role || user?.privateMetadata?.role !== "ADMIN") {
    // Redirect to the home page if the user is not an admin
    redirect("/");
  }
  return (
    <div className='w-full h-full'>
      {/*Sidebar*/}
      <Sidebar isAdmin />
      <div className='h-full ml-[300px]'>
        {/*Header*/}
        <Header />
        <div className='w-full mt-[75px] p-4'>{children}</div>
      </div>
    </div>
  );
}

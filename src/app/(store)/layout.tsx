import CategoriesHeader from "@/components/store/layout/categories-header/categories-header";
import Footer from "@/components/store/layout/footer/footer";
import Header from "@/components/store/layout/header/header";

import { Toaster } from "react-hot-toast";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div>
      <Header />
      <CategoriesHeader />
      <div>{children}</div>
      <div className='h-96'></div>
      <Footer />
      <Toaster position='top-center' />
    </div>
  );
}

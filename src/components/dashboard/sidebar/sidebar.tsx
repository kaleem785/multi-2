import Logo from "@/components/shared/logo";
import { currentUser } from "@clerk/nextjs/server";
import UserInfo from "./user-info";
import SidebarNavAdmin from "./nav-admin";
import {
  adminDashboardSidebarOptions,
  SellerDashboardSidebarOptions,
} from "@/constants/data";
import { Store } from "@/generated/prisma";
import SidebarNavSeller from "./nav-seller";
import StoreSwitcher from "./store-switcher";

interface SidebarProps {
  isAdmin?: boolean;
  stores: Store[];
}

const Sidebar: React.FC<SidebarProps> = async ({ isAdmin, stores }) => {
  const user = await currentUser();
  return (
    <div className='w-[300px] border-r h-screen flex flex-col fixed top-0 left-0 bottom-0'>
      <Logo width='100%' height='180px' />
      <span className='mt-3' />
      {user && <UserInfo user={user} />}
      {!isAdmin && stores && <StoreSwitcher stores={stores} />}
      {isAdmin ? (
        <SidebarNavAdmin menuLink={adminDashboardSidebarOptions} />
      ) : (
        <SidebarNavSeller menuLink={SellerDashboardSidebarOptions} />
      )}
    </div>
  );
};
export default Sidebar;

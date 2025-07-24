"use client";
import { cn } from "@/lib/utils";
import { followerStore } from "@/queries/user";
import { useUser } from "@clerk/nextjs";
import { Check, MessageSquareMore, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { toast } from "react-toastify";

interface Porps {
  store: {
    id: string;
    url: string;
    name: string;
    logo: string;
    followersCount: number;
    isUserFollowingStore: boolean;
  };
}

const StoreCard: FC<Porps> = ({ store }) => {
  const { id, name, logo, url, followersCount, isUserFollowingStore } = store;
  const [following, setFollwing] = useState<boolean>(isUserFollowingStore);
  const [storeFollowersCount, setStoreFollowersCount] =
    useState<number>(followersCount);
  const user = useUser();
  const router = useRouter();
  const handleStoreFollow = async () => {
    if (!user.isSignedIn) router.push("/sign-in");
    try {
      const res = await followerStore(id);
      setFollwing(Boolean(res));
      if (res) {
        setStoreFollowersCount((prev) => prev + 1);
        toast.success(`You are now following ${name}`);
      }
      if (!res) {
        setStoreFollowersCount((prev) => prev - 1);
        toast.success(`You unfollowed ${name}`);
      }
    } catch (error) {
      toast.error("Something happed, try again later !");
    }
  };
  return (
    <div className='w-full'>
      <div className='bg-[#f5f5f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-xl py-3 px-4'>
        <div className='flex'>
          <Link href={`/store/${url}`}>
            <Image
              src={logo}
              alt={name}
              width={50}
              height={50}
              className='w-12 h-12 object-cover rounded-full'
            />
          </Link>
          <div className='mx-2'>
            <div className='text-xl font-bold leading-6'>
              <Link href={`/store/${url}`} className='text-main-primary'>
                {name}
              </Link>
            </div>
            <div className='text-sm leading-5 mt-1'>
              <strong>100%</strong>
              <span>Positive Feedback</span> &nbsp;|&nbsp;
              <strong>{storeFollowersCount}</strong>
              <strong> Followers</strong>
            </div>
          </div>
        </div>
        <div className='flex'>
          <div
            className={cn(
              "flex items-center border border-black rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4 hover:bg-black hover:text-white",
              {
                "bg-black text-white": following,
              }
            )}
            onClick={() => handleStoreFollow()}
          >
            {following ? (
              <Check className='w-4 me-1' />
            ) : (
              <Plus className='w-4 me-1' />
            )}
            <span> {following ? "Following" : "Follow"}</span>
          </div>
          <div className='flex items-center border border-black rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4 bg-black text-white'>
            <MessageSquareMore className='w-4 me-2' />
            <span>Message</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;

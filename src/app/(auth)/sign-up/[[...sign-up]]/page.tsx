import React from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div>
      <div className='flex items-center justify-center min-h-screen'>
        <SignUp />
      </div>
    </div>
  );
}

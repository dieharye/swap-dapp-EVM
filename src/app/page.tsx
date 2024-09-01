'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Page() {
  const router = useRouter();

  useEffect(()=>{
    router.push("/swap")
  },[])

  return (
    <div className="flex w-full h-full justify-center items-center">
      Hello
    </div>
  );
}

export default Page;

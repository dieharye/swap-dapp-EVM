'use client'
import { useEffect, useState } from "react"
import { Address } from "viem";
import VolumeTable from "@/components/competition/VolumeTable"
import PrizeTable from "@/components/competition/PrizeTable"
import { getVolumes, volumeSort } from "@/utils/actions";
import { IVolume } from "@/utils/actions";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const [userVolume, setUserVolume] = useState<Array<IVolume>>([]);
  useEffect(() => {
    const load = async () => {
      const res: any | never = await getVolumes();
      if (res) setUserVolume(volumeSort(res));
    }
    setTimeout(() => {
      load();
    }, 1000)
    // setUserVolume(volumeSort(list));
  }, [])
  return (
    <div className="flex justify-center items-center w-full h-[100vh] text-green-200 pt-[100px]">
      <div className="relative w-[calc(100%-10px)] md:w-[700px] bg-green-950/80 px-5 pt-10 pb-4 mx-4 shadow-3xl shadow-green-600/70 rounded-3xl backdrop-blur-sm">
        <div className="flex justify-between items-baseline mb-4 px-8">
          <div className="text-2xl text-gray-400 hover:text-blue-400 hover:cursor-pointer hover:scale-125 hover:bottom-4 bottom-0 transition-all duration-100" onClick={() => { router.push("/swap") }}>SWAP</div>
          <div className="text-3xl hover:cursor-pointer font-bold">
            BATTLE
          </div>
          <div className="text-2xl text-gray-400 hover:text-blue-400 hover:cursor-pointer hover:scale-125 hover:bottom-4 bottom-0 transition-all duration-100">STAKING</div>
        </div>
        <VolumeTable userVolume={userVolume} />
        <PrizeTable />
      </div>
    </div>
  )
}

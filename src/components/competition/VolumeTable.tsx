import { Address } from "viem"
import { IVolume } from "@/utils/actions"
import UserVolume from "./UserVolume"

export default function VolumeTable({ userVolume }: { userVolume?: Array<IVolume> }) {
  console.log(userVolume);
  console.log("hi")
  return (
    <div className="bg-green-700/30 px-4 py-9 relative rounded-2xl">
      <div className="flex text-orange-200">
        <div className="w-1/12 text-center text-[20px]">No</div>
        <div className="w-1/2 truncate text-center text-[20px]">Account</div>
        <div className="w-[41.6%] text-center text-[20px]">Volume</div>
      </div>
      {(!userVolume || userVolume.length == 0) && <div className="text-orange-200 text-3xl text-center my-4">No data</div>}
      {userVolume?.map((item, index) => { return <UserVolume userVolume={item} key={index} index={index} /> })}
    </div>
  )
}
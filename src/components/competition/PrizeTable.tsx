

import Image from "next/image"

export default function PrizeTable() {
  return (
    <div className="relative px-4 py-4 rounded-2xl my-4">
      <div className="absolute aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-1/2 h-full z-[0] opacity-30">
        <Image src="/prize.png" fill alt=""/>
      </div>
      <div className="relative text-3xl font-medium text-white text-center z-10">
        Rewards for Winners
      </div>
      <div className="relative z-10">
        <div className="flex justify-center gap-8 my-4">
          <div className="text-2xl w-1/3 text-center">
            RANK
          </div>
          <div className="text-2xl w-1/3 text-center">
            REWARD
          </div>
        </div>
        <div className="flex justify-center gap-8 my-6">
          <div className="relative text-3xl w-1/3">
            <div className="absolute top-1/2 left-1/2 rotate-12 -translate-x-1/2 -translate-y-1/2 aspect-[224/416] w-[30px]">
              <Image src="/medal1.png" fill alt="" />
            </div>
          </div>
          <div className="w-1/3 text-center text-[25px] text-yellow-400">
            120$
          </div>
        </div>
        <div className="flex justify-center gap-8 my-6">
          <div className="relative text-3xl w-1/3">
            <div className="absolute top-1/2 left-1/2 rotate-12 -translate-x-1/2 -translate-y-1/2 aspect-[224/416] w-[30px]">
              <Image src="/medal2.png" fill alt="" />
            </div>
          </div>
          <div className="w-1/3 text-center text-[25px] text-yellow-400">
            80$
          </div>
        </div>
        <div className="flex justify-center gap-8 my-6">
          <div className="relative text-3xl w-1/3">
            <div className="absolute top-1/2 left-1/2 rotate-12 -translate-x-1/2 -translate-y-1/2 aspect-[224/416] w-[30px]">
              <Image src="/medal3.png" fill alt="" />
            </div>
          </div>
          <div className="w-1/3 text-center text-[25px] text-yellow-400">
            50$
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import SwapSide from "@/components/swap/SwapSide"
import { ArrowUpDown, Wallet2 } from "lucide-react"
import ActionButton from "@/components/ActionButton"
import { useCallback, useEffect, useState } from "react"
import { TOKEN_LIST } from "@/config"
import { useAccount, useConfig } from "wagmi"
import Image from "next/image"
import { toast } from "react-toastify"
import { swapTokens, getQuote, getVolumes } from "@/utils/actions"
import { Address } from "viem"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/AppContext"

export default function Page() {
  const [baseToken, setBaseToken] = useState(3);
  const [quoteToken, setQuoteToken] = useState(2);
  const [baseAmount, setBaseAmount] = useState(0);
  const [quoteAmount, setQuoteAmount] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const { address } = useAccount();
  const router = useRouter();
  const config = useConfig();
  const { setIsQuateLoading, swapChange } = useAppContext();

  const changeQuote = async () => {
    const res = await getQuote(config, baseToken, baseAmount, quoteToken);
    if (res != undefined) setQuoteAmount(res);
  }

  useEffect(() => {
    const load = async () => {
      setIsQuateLoading(true);
      await changeQuote();

      setTimeout(() => {
        setIsQuateLoading(false);
      }, 1000)
    }
    if (baseToken == quoteToken) return;
    load();
  }, [config, baseToken, quoteToken, baseAmount]);

  const exchangeToken = () => {
    const base = baseToken;
    const quote = quoteToken;
    setBaseToken(quote);
    setQuoteToken(base);
  }

  const swap = useCallback(async () => {
    if (baseToken == quoteToken) return;
    setIsSwapping(true);
    const res: boolean = await swapTokens(config, baseToken, quoteToken, baseAmount, address)
    if (res) {
      swapChange();
      toast.success("Transaction successfully finished");
    }
    setIsSwapping(false);
  }, [baseToken, quoteToken, baseAmount, address])
  return (
    <div className="flex justify-center items-center w-full h-[100vh] text-orange-400">
      <div className={`bg-gray-50/70 fixed w-full h-full z-50 ${isSwapping ? "block" : "hidden"}`}>
        <div className="flex justify-center items-center w-full h-full">
          <div className="relative aspect-square w-[100px]">
            <Image src="/loading.gif" fill alt="" />
          </div>
        </div>
      </div>
      <div className="relative w-[450px] bg-green-950/80 px-5 pt-10 pb-4 mx-4 shadow-3xl shadow-green-600/70 rounded-3xl backdrop-blur-sm">
        <div className="flex justify-between gap-2 px-8">
          <div className="rounded flex justify-center items-center text-3xl font-bold hover:cursor-pointer text-green-200">
            SWAP
          </div>
          <div onClick={() => { router.push("/competition") }} className="text-2xl text-gray-400 hover:text-blue-400 hover:cursor-pointer hover:scale-125 hover:bottom-4 bottom-0 transition-all duration-100">
            BATTLE
          </div>
          <div className="text-2xl text-gray-400 hover:text-blue-400 hover:cursor-pointer hover:scale-125 hover:bottom-4 bottom-0 transition-all duration-100">
            STAKING
          </div>
        </div>
        <div className="mt-[10px] flex flex-col relative">
          <SwapSide setCoin={setBaseToken} coin={baseToken} opCoin={quoteToken} amount={baseAmount} setAmount={setBaseAmount} />
          <div onClick={exchangeToken} className="w-14 h-14 hover:cursor-pointer grid place-content-center rounded-full bg-green-600/20 backdrop-blur-sm shadow-3s absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Image src="/swap.png" fill alt="" />
          </div>
          <SwapSide className="mt-5" disabled setCoin={setQuoteToken} coin={quoteToken} opCoin={baseToken} amount={quoteAmount} setAmount={setQuoteAmount} />
        </div>
        <div className="mt-4" >
          <ActionButton swap={swap} />
        </div>
      </div>
    </div>
  )
}
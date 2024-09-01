'use client'

import { TOKEN_LIST } from '@/config'
import Image from 'next/image';

export default function TokenItem(props: any) {
  const {token, setCoin, closeMenu} = props;
  const clickHandler = () => {
    if(setCoin) setCoin(TOKEN_LIST.indexOf(token));
    if(closeMenu) closeMenu()
  }

  return (
    <div className={`flex w-full gap-3 items-center p-1 rounded hover:cursor-pointer text-blue-200 ${setCoin && "hover:bg-primary-gray-300" }`} onClick={clickHandler}>
      <div className="relative w-8 h-8">
        <Image className="rounded-full" src={`/token_icons/${token.name}.png`} fill alt="" />
      </div>
      <div className="">
        {token.name}
      </div>
    </div>
  )
}
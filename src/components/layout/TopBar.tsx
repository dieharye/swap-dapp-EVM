'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

function TopBar() {
  return (
    <div className="flex w-full fixed justify-between items-center px-8 py-2 z-50">
      <div className="flex justify-center rounded-full w-32 h-32 bg-green-700/50 backdrop-blur-sm border-8 border-green-500">
        <div className="relative h-full aspect-[680/517] ">
          <Image className='scale-125' src="/logo.png" fill alt="" />
        </div>
      </div>
      <div className='h-8'>
        <ConnectButton />
      </div>
    </div>
  );
}

export default TopBar;

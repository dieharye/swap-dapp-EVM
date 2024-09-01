'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { TOKEN_LIST } from '@/config';
import TokenItem from '@/components/swap/TokenItem';

export default function TokenSelect(props: any) {
  const { coin, opCoin, setCoin, } = props
  const [showMenu, setShowMenu] = useState(false);
  const newRef = useRef<HTMLDivElement>(null); // Typing the ref correctly

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | Event) => {
      if (newRef.current && !newRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []); // Ensure the effect has an empty dependency array to prevent it from running on every render

  const toggleSelect = () => {
    setShowMenu((prev) => !prev);
  };

  const closeMenu = () => {
    setShowMenu(false)
  }

  return (
    <div className="relative min-w-[110px] h-12" ref={newRef}>
      <button
        className="flex justify-between h-full items-center gap-2 rounded-xl bg-green-700 py-1 px-3 hover:shadow-button hover:shadow-blue-400"
        onClick={toggleSelect}
      >
        <div>
          {coin == null ? "Select Token" : <TokenItem token={TOKEN_LIST[coin]} />}
        </div>
        <ChevronDown className="mt-1 text-blue-200" size={15} />
      </button>
      {showMenu && (
        <div className="absolute min-w-[110px] top-[110%] left-0 max-h-[200px] bg-primary-gray-200/50 shadow shadow-blue-400 backdrop-blur rounded p-1 z-50 overflow-auto">
          {TOKEN_LIST.map((item, index) => {
            if (index == opCoin) return <></>
            return <TokenItem key={index} token={item} setCoin={setCoin} closeMenu={closeMenu} />
          })}
        </div>
      )}
    </div>
  );
}

'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSwitchChain, useChainId, } from 'wagmi';
import { base, cronos, cronosTestnet, mainnet } from 'viem/chains';
import Image from 'next/image';

export default function ConnectWalletButton({ swap } : any) {
  const { chains, switchChain, error } = useSwitchChain();
  const chainId = useChainId();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        const switchChainHandle = async () => {
          switchChain({ chainId: cronos.id })
        }

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button"
                    className='flex justify-center items-center gap-4 w-full py-3 bg-green-600 text-xl rounded-xl hover:shadow-button text-blue-200 hover:shadow-blue-400 hover:text-blue-400'>
                    <div className='relative w-12 h-12'>
                      <Image src="/wallet.png" fill alt="" />
                    </div>
                    Connect wallet
                  </button>
                );
              }

              if (chainId != cronos.id && chainId != cronosTestnet.id) {
                return (
                  <button onClick={switchChainHandle} type="button"
                    className='flex justify-center items-center gap-4 w-full py-3 bg-green-600 text-xl rounded-xl hover:shadow-button hover:shadow-blue-400 hover:text-blue-400 text-orange-600 uppercase tracking-widest'>
                    <div className='relative w-12 h-12'>
                      <Image src="/switch.png" fill alt="" />
                    </div>
                    Switch wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button"
                    className='w-full py-3 bg-green-600 text-xl rounded-xl hover:shadow-button hover:shadow-blue-400 hover:text-blue-400 text-orange-700 uppercase tracking-widest'>
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={swap}
                    type="button"
                    className='flex justify-center items-center w-full py-3 bg-green-600 rounded-xl hover:shadow-button hover:shadow-blue-400 tracking-widest'
                  >
                    <div className='relative w-12 h-12'>
                      <Image src="/check.png" fill alt="" />
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  )
}
import ARY from '@/abis/ARY.json';
import USDC from '@/abis/USDC.json';
import USDT from '@/abis/USDT.json';
import WCRO from '@/abis/WCRO.json';
import Contract from '@/abis/Contract.json';
import VVS2_Router_Abi from '@/abis/VVS2_Router.json';
import FACTORY from '@/abis/Factory.json';

export const Abis: {[key: string]: any} = { ARY, USDC, USDT, WCRO };
export const CONTRACT_ABI = Contract;
export const VVS2_ABI = VVS2_Router_Abi;
export const FACTORY_ABI = FACTORY;

export interface TokenConfig {
  name: keyof typeof Abis;
  address: string | undefined;
}

export const getAbi = (token: TokenConfig) => {
  const { name, address } = token;
  const abi = Abis[name];

  return abi
};

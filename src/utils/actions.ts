
import { readContract, writeContract } from '@wagmi/core';
import { config } from '../config/wagmi';
import { Address } from 'viem';
import { Abis } from '@/utils';
import { CONTRACT_ADDRESS, TOKEN_LIST, WCRO, VVS2Router, fee, } from '../config';
import { CONTRACT_ABI, VVS2_ABI } from '@/utils';
import { getBalance } from 'wagmi/actions';
import { parseEther } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions';
import { toast } from 'react-toastify';
import { Config } from "wagmi"

export interface IVolume {
  user: Address;
  volume: BigInt;
}

export const getNativeBalance = async (config: Config, address: Address, chainId: number) => {
  if (!address) return 0;
  try {
    const { decimals, value } = await getBalance(config, { address, chainId });
    return convertBignitTofloat(value, decimals);
  } catch (error) {
    console.log(error);
    toast.warning("Switch to the Cronos chain.");
    return 0
  }

}

export const getQuote = async (config: Config, baseToken: number, baseAmount: number, quoteToken: number) => {
  const base = TOKEN_LIST[baseToken];
  const amount = baseAmount * 10 ** base.decimal;
  if (!base || typeof base == 'undefined' || !baseAmount || isNaN(parseFloat(baseAmount.toString()))) return 0;


  const quote = TOKEN_LIST[quoteToken];
  if (base.isNative && quote.name == "WCRO") return baseAmount;
  if (base.name == "WCRO" && quote.isNative) return baseAmount;

  let token1 = base.isNative ? WCRO : base;
  let token2 = quote.isNative ? WCRO : quote;
  try {
    const abi = VVS2_ABI;
    let path: any;
    if (token1.name == "WCRO" || token2.name == "WCRO") {
      path = [token1.address as Address, token2.address as Address];
    } else {
      path = [token1.address as Address, WCRO.address as Address, token2.address as Address];
    }
    let res: any = await readContract(config, {
      abi, address: VVS2Router as Address,
      functionName: "getAmountsOut",
      args: [amount, path]
    });
    res = res[res.length - 1]
    console.log(amount, res)
    return parseFloat((Number(res) / (10 ** token2.decimal) * (100 - fee) / 100).toString())

  } catch (error) {
    console.log(error)
    // toast.error("Can not get quote amount");
    return 0;
  }
}

export const getTokenBalance = async (config: Config, address: Address, chainId: number, tokenId: number) => {
  const token = TOKEN_LIST[tokenId];
  const tokenAddress = token.address;
  const abi = Abis[token.name]
  if (!address || !config || !tokenAddress) return 0;
  try {
    const tokenBalance = await readContract(config, {
      abi, functionName: 'balanceOf',
      address: tokenAddress as Address, args: [address as Address]
    })

    return convertBignitTofloat(tokenBalance, token.decimal);
  } catch (error) {
    toast.warning("Switch to the Cronos Chain");
    return 0;
  }
}

export const convertBignitTofloat = (value: any, decimal: number) => {
  return parseFloat((Number(value) / Math.pow(10, decimal)).toFixed(3))
}

export const approve = async (config: Config, tokenId: number, amount: any, spenderAddress: Address = CONTRACT_ADDRESS) => {
  const token = TOKEN_LIST[tokenId];
  const tokenAddress = token.address;
  const abi = Abis[token.name]
  const appr = await writeContract(config, {
    abi,
    functionName: "approve",
    address: tokenAddress as Address, args: [spenderAddress, amount]
  }).then(async (hash) => {
    console.log("Approve Tx:", hash);
    toast.warning('Please wait');
    await waitForTransactionReceipt(config, {
      hash,
    });
    return true
  }).catch((reason) => {
    console.log("Approve faild:", reason);
    toast.error("Transaction failed");
    return false
  });
  return appr
}

export const getAllowance = async (config: Config, tokenId: number, owner: Address, spender: Address = CONTRACT_ADDRESS) => {
  const token = TOKEN_LIST[tokenId];
  const tokenAddress = token.address;
  const abi = Abis[token.name]
  const allowance = await readContract(config, {
    abi,
    address: tokenAddress as Address,
    functionName: "allowance",
    args: [owner, spender],
  })
}

export const deposit = async (config: Config, amount: number, address: Address | undefined) => {
  try {
    const res = await writeContract(config, {
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS as Address,
      functionName: 'deposit',
      args: [],
      account: address as Address,
      value: parseEther(amount.toString())
    }).then(async (hash) => {
      console.log("Approve Tx:", hash);
      toast.warning('Please wait');
      await waitForTransactionReceipt(config, {
        hash,
      });
      return true
    })
      .catch((reason) => {
        console.log("Approve faild:", reason);
        toast.error("Transaction failed");
        return false
      });
    console.log(res)
    return res
  } catch (error) {
    console.log(error)
    toast.error("Transcation failed");
    return false;
  }
}

export const withdraw = async (config: Config, tokenId: number, tokenAmount: number, address: Address | undefined) => {
  const token: any = TOKEN_LIST[tokenId];
  const amount = BigInt(tokenAmount * 10 ** token.decimal)
  const res = await approve(config, tokenId, amount);
  if (!res) {
    return false;
  }
  const abi = Abis[token.name];

  try {
    const res = await writeContract(config, {
      abi,
      address: CONTRACT_ADDRESS as Address,
      functionName: 'withdraw',
      args: [amount],
      account: address as Address
    }).then(async (hash) => {
      console.log("Tx:", hash);
      toast.warning('Please wait');
      await waitForTransactionReceipt(config, {
        hash,
      });
      return true
    })
      .catch((reason) => {
        console.log("Faild:", reason);
        toast.error("Transaction Faild");
        return false
      });
    return res;
  } catch (error) {
    console.log(error);
    toast.error("Transcation Faild");
    return false
  }
}

export const swapTokenForNative = async (config: Config, baseToken: number, baseAmount: number, address: Address | undefined) => {
  const token: any = TOKEN_LIST[baseToken];
  const amountIn = BigInt(baseAmount * 10 ** token.decimal);
  const amountOut = 0;
  const res = await approve(config, baseToken, amountIn);
  if (!res) {
    return false;
  }

  try {
    await writeContract(config, {
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      args: [token.address, amountIn, amountOut],
      functionName: 'swapTokenForCRO'
    }).then(async (hash) => {
      await waitForTransactionReceipt(config, { hash });
      return true;
    }).catch((error) => {
      console.log(error);
      toast.error("Transaction failed");
      return false
    })
  } catch (error) {
    toast.error("Transaction failed");
    return false;
  }

  return true;
}

export const swapNativeForToken = async (config: Config, quoteToken: number, baseAmount: number, address: Address | undefined) => {
  const amountIn = BigInt(baseAmount * 10 ** 18);
  const amountOut = 0;
  const token: any = TOKEN_LIST[quoteToken];

  try {
    await writeContract(config, {
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      args: [token.address, amountOut],
      functionName: 'swapCROForToken',
      value: amountIn
    }).then(async (hash) => {
      await waitForTransactionReceipt(config, { hash });
      return true;
    }).catch((error) => {
      console.log(error);
      toast.error("Transaction failed");
      return false
    })
  } catch (error) {
    toast.error("Transaction failed");
    return false;
  }

  return true;
}

export const swapTokenForToken = async (config: Config, baseToken: number, quoteToken: number, baseAmount: number, address: Address | undefined) => {
  const fromToken: any = TOKEN_LIST[baseToken];
  const toToken: any = TOKEN_LIST[quoteToken];
  const amountIn = BigInt(baseAmount * 10 ** fromToken.decimal);
  const amountOut = 0;
  const res = await approve(config, baseToken, amountIn);
  if (!res) {
    return false;
  }

  try {
    await writeContract(config, {
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      args: [fromToken.address, toToken.address, amountIn, amountOut],
      functionName: 'swapTokenForToken'
    }).then(async (hash) => {
      await waitForTransactionReceipt(config, { hash });
      return true;
    }).catch((error) => {
      console.log(error);
      toast.error("Transaction failed");
      return false
    })
  } catch (error) {
    toast.error("Transaction failed");
    return false;
  }

  return true;
}


export const swapTokens = async (config: Config, baseToken: number, quoteToken: number, baseAmount: number, address: Address | undefined) => {
  let res: boolean;
  if (TOKEN_LIST[baseToken].isNative) {
    if (TOKEN_LIST[quoteToken].name == "WCRO") {
      res = await deposit(config, baseAmount, address);
    } else {
      res = await swapNativeForToken(config, quoteToken, baseAmount, address);
    }
  } else if (TOKEN_LIST[quoteToken].isNative) {
    if (TOKEN_LIST[baseToken].name == "WCRO") {
      res = await withdraw(config, baseToken, baseAmount, address);
    } else {
      res = await swapTokenForNative(config, baseToken, baseAmount, address);
    }
  } else {
    res = await swapTokenForToken(config, baseToken, quoteToken, baseAmount, address)
  }
  return res
};

export const getVolumes = async () => {
  console.log(CONTRACT_ABI, CONTRACT_ADDRESS)
  const res = await readContract(config, {
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    args: [],
    functionName: 'getUserVolumes'
  }).then(async (data) => {
    console.log(data)
    return data;
  }).catch((error) => {
    console.log(error);
    return null
  })
  console.log(res)
  return res;
}

export const volumeSort = (volumeList: Array<any>) => {
  const len = volumeList.length;
  for (let i = 0; i < len - 1; i++) {
    for (let j = i + 1; j < len; j++) {
      if (Number(volumeList[i].volume) < Number(volumeList[j].volume)) {
        const temp: IVolume = { ...volumeList[i] }
        volumeList[i] = volumeList[j];
        volumeList[j] = temp;
      }
    }
  }
  return volumeList;
}

export const clearVolume = async () => {
  try {
    await writeContract(config, {
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      args: [],
      functionName: 'clear'
    }).then(async (hash) => {
      await waitForTransactionReceipt(config, { hash });
      return true;
    }).catch((error) => {
      console.log(error);
      toast.error("Transaction failed");
      return false
    })
  } catch (error) {
    toast.error("Transaction failed");
    return false;
  }
}

export const convertBignitToString = (num: BigInt) => {
  const eth: any = Number(num) / 10 ** 18;
  const head = eth.toString().split(".")[0];
  if (head.length > 9) return head.slice(0, head.length - 9) + "B";
  if (head.length > 6) return head.slice(0, head.length - 6) + "M";
  if (head.length > 3) return head.slice(0, head.length - 3) + "K";
  return eth.toFixed(3)
}
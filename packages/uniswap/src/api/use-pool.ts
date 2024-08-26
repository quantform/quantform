import { Token } from '@uniswap/sdk-core';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';

import { useOptions } from '@lib/use-options';

import { useProvider } from './use-provider';

export function usePool(tokenA: Token, tokenB: Token) {
  const { factoryAddress } = useOptions();
  const provider = useProvider();

  const address = computePoolAddress({
    factoryAddress,
    tokenA,
    tokenB,
    fee: FeeAmount.LOW
  });

  console.log('address', address);

  return new ethers.Contract(
    '0x3416cF6C708Da44DB2624D63ea0AAef7113527C6',
    IUniswapV3PoolABI.abi,
    provider
  );
}

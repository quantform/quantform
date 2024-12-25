import { ethers, Interface, InterfaceAbi } from 'ethers';

import { useProvider } from './use-provider';

export function useContract(address: string, abi: Interface | InterfaceAbi) {
  const provider = useProvider();

  return new ethers.Contract(address, abi, provider);
}

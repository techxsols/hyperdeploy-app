import {
  zeroAddress,
  type Address,
  type Chain as ChainData,
  type Hex,
} from 'viem';
import { polygonMumbai, scrollSepolia, sepolia } from 'viem/chains';

const CHAIN_SEPOLIA = 11155111;
const CHAIN_POLYGON_MUMBAI = 80001;
const CHAIN_SCROLL_SEPOLIA = 534351;
type Chain =
  | typeof CHAIN_SEPOLIA
  | typeof CHAIN_POLYGON_MUMBAI
  | typeof CHAIN_SCROLL_SEPOLIA;

const CHAINS: Chain[] = [
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
];

function isSourceSupported(chain: Chain): boolean {
  return getBytecodeRouterAddress(chain) !== zeroAddress;
}

function isTargetSupported(chain: Chain): boolean {
  return getRecipient(chain) !== zeroAddress;
}

function getMailboxAddress(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return '0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766';
    case CHAIN_POLYGON_MUMBAI:
      return '0x2d1889fe5B092CD988972261434F7E5f26041115';
    case CHAIN_SCROLL_SEPOLIA:
      return '0x3C5154a193D6e2955650f9305c8d80c18C814A68';
  }
}

function getBytecodeRouterAddress(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return '0x6D00Ad8878ec1f75c56e3953839e990850635317';
    case CHAIN_POLYGON_MUMBAI:
      return zeroAddress;
    case CHAIN_SCROLL_SEPOLIA:
      return zeroAddress;
  }
}

function addressToBytes32(address: Address): Hex {
  return `0x${address.slice(2).padStart(64, '0')}`;
}

function getChainData(chain: Chain): ChainData {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return sepolia;
    case CHAIN_POLYGON_MUMBAI:
      return polygonMumbai;
    case CHAIN_SCROLL_SEPOLIA:
      return scrollSepolia;
  }
}

function getRecipient(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return zeroAddress;
    case CHAIN_POLYGON_MUMBAI:
      return '0xD0B7BFE8bc7a635Ce2E514c1b4Eb5C9238Ef9998';
    case CHAIN_SCROLL_SEPOLIA:
      return '0xF0FB374975dFbDAF18f9E85Ddc4939A4b37A56bE';
  }
}

function getRecipients(chains: Chain[]): Address[] {
  return chains.map(getRecipient);
}

function getHookMetadatas(chains: Chain[]): Hex[] {
  function getHookMetadata(chain: Chain): Hex {
    switch (chain) {
      case CHAIN_SEPOLIA:
        return '0x';
      case CHAIN_POLYGON_MUMBAI:
        return '0x';
      case CHAIN_SCROLL_SEPOLIA:
        return '0x';
    }
  }
  return chains.map(getHookMetadata);
}

function getHooks(chains: Chain[]): Address[] {
  const DEFAULT_HOOK = '0x17Dc724B7a2F09141C13b8AC33B396073785c2BC';
  function getHook(chain: Chain): Address {
    switch (chain) {
      case CHAIN_SEPOLIA:
        return DEFAULT_HOOK;
      case CHAIN_POLYGON_MUMBAI:
        return DEFAULT_HOOK;
      case CHAIN_SCROLL_SEPOLIA:
        return DEFAULT_HOOK;
    }
  }
  return chains.map(getHook);
}

function getRpcUrl(chain: Chain): string {
  const chainData = getChainData(chain);
  return chainData.rpcUrls.default.http[0];
}

export {
  CHAINS,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
  CHAIN_SEPOLIA,
  getMailboxAddress,
  getBytecodeRouterAddress,
  addressToBytes32,
  getChainData,
  getRecipient,
  getRecipients,
  getHookMetadatas,
  getHooks,
  getRpcUrl,
  isTargetSupported,
  isSourceSupported,
};
export type { Chain };

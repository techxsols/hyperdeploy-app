import {
  zeroAddress,
  type Address,
  type Chain as ChainData,
  type Hex,
} from 'viem';
import {
  avalancheFuji,
  bscTestnet,
  celoAlfajores,
  moonbaseAlpha,
  polygonMumbai,
  scrollSepolia,
  sepolia,
} from 'viem/chains';

const CHAIN_SEPOLIA = 11155111;
const CHAIN_POLYGON_MUMBAI = 80001;
const CHAIN_SCROLL_SEPOLIA = 534351;
const CHAIN_ALFAJORES = 44787;
const CHAIN_FUJI = 43113;
const CHAIN_BSC_TESTNET = 97;
const CHAIN_MOONBASE_ALPHA = 1287;
type Chain =
  | typeof CHAIN_SEPOLIA
  | typeof CHAIN_POLYGON_MUMBAI
  | typeof CHAIN_SCROLL_SEPOLIA
  | typeof CHAIN_ALFAJORES
  | typeof CHAIN_FUJI
  | typeof CHAIN_BSC_TESTNET
  | typeof CHAIN_MOONBASE_ALPHA;

const CHAINS: Chain[] = [
  CHAIN_SEPOLIA,
  CHAIN_POLYGON_MUMBAI,
  CHAIN_SCROLL_SEPOLIA,
  CHAIN_ALFAJORES,
  CHAIN_FUJI,
  CHAIN_BSC_TESTNET,
  CHAIN_MOONBASE_ALPHA,
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
    case CHAIN_ALFAJORES:
      return '0xEf9F292fcEBC3848bF4bB92a96a04F9ECBb78E59';
    case CHAIN_FUJI:
      return '0x5b6CFf85442B851A8e6eaBd2A4E4507B5135B3B0';
    case CHAIN_BSC_TESTNET:
      return '0xF9F6F5646F478d5ab4e20B0F910C92F1CCC9Cc6D';
    case CHAIN_MOONBASE_ALPHA:
      return '0x76189acFA212298d7022624a4633411eE0d2f26F';
  }
}

function getBytecodeRouterAddress(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return '0x430aC47A3Ea1Ecc240cAB740b35fEFF2b75a1ec8';
    case CHAIN_POLYGON_MUMBAI:
      return '0xDbE35849810c77f2C85D2769444fB3566dAFd180';
    case CHAIN_SCROLL_SEPOLIA:
      return '0xDbE35849810c77f2C85D2769444fB3566dAFd180';
    case CHAIN_ALFAJORES:
      return '0x7bF601DE6a3bf24678ed06282F1C8fEEC019B554';
    case CHAIN_FUJI:
      return '0x7bF601DE6a3bf24678ed06282F1C8fEEC019B554';
    case CHAIN_BSC_TESTNET:
      return '0x7bF601DE6a3bf24678ed06282F1C8fEEC019B554';
    case CHAIN_MOONBASE_ALPHA:
      return '0x7bF601DE6a3bf24678ed06282F1C8fEEC019B554';
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
    case CHAIN_ALFAJORES:
      return celoAlfajores;
    case CHAIN_BSC_TESTNET:
      return bscTestnet;
    case CHAIN_FUJI:
      return avalancheFuji;
    case CHAIN_MOONBASE_ALPHA:
      return moonbaseAlpha;
  }
}

function getRecipient(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return '0x0c28ceEa8595685aAB7EDf759a7c94DE18A5a6E6';
    case CHAIN_POLYGON_MUMBAI:
      return '0xD0B7BFE8bc7a635Ce2E514c1b4Eb5C9238Ef9998';
    case CHAIN_SCROLL_SEPOLIA:
      return '0xF0FB374975dFbDAF18f9E85Ddc4939A4b37A56bE';
    case CHAIN_ALFAJORES:
      return '0xBCDC35bE8fc6e022e9D14b25FEB76AE4d83035de';
    case CHAIN_BSC_TESTNET:
      return '0xBCDC35bE8fc6e022e9D14b25FEB76AE4d83035de';
    case CHAIN_FUJI:
      return '0xBCDC35bE8fc6e022e9D14b25FEB76AE4d83035de';
    case CHAIN_MOONBASE_ALPHA:
      return '0xBCDC35bE8fc6e022e9D14b25FEB76AE4d83035de';
  }
}

function getRecipients(chains: Chain[]): Address[] {
  return chains.map(getRecipient);
}

function getHookMetadatas(chains: Chain[]): Hex[] {
  function getHookMetadata(chain: Chain): Hex {
    switch (chain) {
      case CHAIN_SEPOLIA:
      case CHAIN_POLYGON_MUMBAI:
      case CHAIN_SCROLL_SEPOLIA:
      case CHAIN_ALFAJORES:
      case CHAIN_BSC_TESTNET:
      case CHAIN_FUJI:
      case CHAIN_MOONBASE_ALPHA:
        return '0x';
    }
  }
  return chains.map(getHookMetadata);
}

function getHook(chain: Chain): Address {
  switch (chain) {
    case CHAIN_SEPOLIA:
      return '0x17Dc724B7a2F09141C13b8AC33B396073785c2BC';
    case CHAIN_POLYGON_MUMBAI:
      return '0x31191BA83143b4745745389fEe64990c65F36829';
    case CHAIN_SCROLL_SEPOLIA:
      return '0xE1CCB130389f687bf745Dd6dc05E50da17d9ea96';
    case CHAIN_ALFAJORES:
      return '0x3528B1aeF3a3d29E0eae90ad777A2b4A6a48aC3F';
    case CHAIN_BSC_TESTNET:
      return '0x2670ED2EC08cAd135307556685a96bD4c16b007b';
    case CHAIN_FUJI:
      return '0xc684f7F50DB4b2563218512e021fBdd0BeD6b57E';
    case CHAIN_MOONBASE_ALPHA:
      return zeroAddress;
  }
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
  CHAIN_ALFAJORES,
  CHAIN_FUJI,
  CHAIN_BSC_TESTNET,
  CHAIN_MOONBASE_ALPHA,
  getMailboxAddress,
  getBytecodeRouterAddress,
  addressToBytes32,
  getChainData,
  getRecipient,
  getRecipients,
  getHookMetadatas,
  getHook,
  getRpcUrl,
  isTargetSupported,
  isSourceSupported,
};
export type { Chain };

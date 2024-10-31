import _, { chain } from "lodash";
import * as wagmi from "@wagmi/core";

const categories = ["evm", "solana", "bitcoin", "starknet", "benfen"] as const;
export type Category = (typeof categories)[number];

type Wallet = {
  name: string;
  icon: string;
  connector: wagmi.Connector;
  categories: Category[];
};

type Chain = {
  name: string;
  chainId?: string | number;
  rpcUrl: string;
  icon: string;
  category: Category;
};

/**
 * controller
 */
export type Config = {
  [key: symbol]: wagmi.Config;
  readonly connectors: readonly wagmi.Connector[];
};

export type CreateConfigOptions = {
  evm: wagmi.CreateConfigParameters<any, any>;
};

interface WalletController {}

export function createConfig({
  wallets,
  chains,
}: {
  chains: Chain[];
  wallets: Wallet[];
}) {
  const result = { __internal: new Map<Category, WalletController>() };

  const chainsByCategory = _.groupBy(chains, (item) => item.category);

  const walletsByCategory = _.groupBy(
    wallets
      .map(({ categories, ...item }) =>
        categories.map((category) => ({ ...item, category }))
      )
      .flat(),
    (item) => {
      return item.category;
    }
  );

  if (walletsByCategory.evm) {
    const chains = chainsByCategory.evm;

    const wagmiConfig = wagmi.createConfig({
      // @ts-ignore
      chains,
      // @ts-ignore
      connectors: walletsByCategory.evm.map((item) => item.connector),
      transports: chains.reduce((acc, { chainId, rpcUrl }) => {
        if (typeof chainId !== "number") {
          throw new Error(`Expect wagmi chainId is number but got ${chainId}`);
        }
        return {
          ...acc,
          [chainId]: wagmi.http(rpcUrl),
        };
      }, {}),
    });
    result.__internal.set("evm", wagmiConfig);
  }

  if (walletsByCategory.solana) {
  }

  // TODO: implement other categories
  return result;
}

/**
 * number if it's a EVM chain otherwise string
 */
export type ChainIdOrName = number | string;

export function connect(config: Config, category: Category, wallet: string) {
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      let connector = wagmiConfig.connectors.find(
        (item) => item.name === wallet
      );
      if (!connector) {
        throw new Error(`Can't find connector for ${wallet}`);
      }
      return wagmi.connect(wagmiConfig, { connector });
    }
    default:
      throw new Error("not implemented");
  }
}

export function disconnect(config: Config, category: Category) {
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      return wagmi.disconnect(wagmiConfig);
    }
    default:
      throw new Error("not implemented");
  }
}

// export function getChain(config: Config, category: Category): ChainIdOrName {
//   switch (category) {
//     case "evm": {
//       const wagmiConfig = config[uniqueKeys.evm];
//       if (!wagmiConfig) {
//         throw new Error("No config found for evm");
//       }
//       return wagmi.getChainId(wagmiConfig);
//     }
//     default:
//       throw new Error("not implemented");
//   }
// }

export function getAccount(config: Config, category: Category) {
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      return wagmi.getAccount(wagmiConfig);
    }
    default:
      throw new Error("not implemented");
  }
}

export function switchChain(config: Config, chain: ChainIdOrName) {
  const category = chainToCategory(chain);
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      if (typeof chain !== "number") {
        throw new Error("unreachable");
      }
      return wagmi.switchChain(wagmiConfig, { chainId: chain });
    }
    default:
      throw new Error("not implemented");
  }
}

export function signMessage(
  config: Config,
  category: Category,
  message: string
) {
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      if (typeof chain !== "number") {
        throw new Error("unreachable");
      }
      return wagmi.signMessage(wagmiConfig, payload);
    }
    default:
      throw new Error("not implemented");
  }
}

export function sendTransaction(
  config: Config,
  category: Category,
  payload: unknown
) {
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      return wagmi.sendTransaction(wagmiConfig, payload);
    }
    default:
      throw new Error("not implemented");
  }
}

export function watchAccount(
  config: Config,
  onChange: (account: any, preAccount: any) => void
) {
  const unwatchList: (() => void)[] = [];
  if (config[uniqueKeys.evm]) {
    unwatchList.push(wagmi.watchAccount(config[uniqueKeys.evm], { onChange }));
  }
  // TODO: implement other categories

  return () => {
    unwatchList.forEach((item) => item());
  };
}

// ─── Internal Methods ────────────────────────────────────────────────────────
function chainToCategory(chain: ChainIdOrName): Category {
  if (typeof chain === "number") return "evm";
  throw new Error(`unknown chain ${chain}`);
}

// ─────────────────────────────────────────────────────────────────────────────

//
// createConfig 应该接收链的配置和wallet的配置
// chains = [
//   {
//     name: "BaseMainnet",
//     chainId: "8453",
//     rpcUrl: "https://mainnet.base.org",
//     icon: "https://base.org/icon.png",
//     category: "Evm",
//   },
//   {
//     name: "EthereumMainnet",
//     chainId: "1",
//     rpcUrl: "https://mainnet.ethereum.org",
//     icon: "https://ethereum.org/icon.png",
//     category: "Evm",
//   },
//   {
//     name: "SolanaMainnet",
//     rpcUrl: "https://mainnet.solana.org",
//     icon: "https://solana.org/icon.png",
//     category: "Solana",
//   },
// ]
//
// const wallets = [
//   {
//     name: "MetaMask",
//     icon: "https://metamask.io/icon.png",
//     connector: metaMask,
//     category: ["Evm"],
//   },
//   {
//     name: "Fantom",
//     icon: "https://fantom.foundation/icon.png",
//     connector: fantom,
//     category: ["Evm", "Solana"],
//   },
// ]
//
// const owlletConfig = createConfig(chains, wallets)
//
// chains, wallets

function createSolanaConfig() {}

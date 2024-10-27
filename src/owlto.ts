import * as wagmi from "@wagmi/core";

const categories = ["evm", "solana", "bitcoin", "starknet", "benfen"] as const;
export type Category = (typeof categories)[number];

const uniqueKeys = categories.reduce(
  (acc, item) => ({
    ...acc,
    [item]: Symbol(item),
  }),
  {} as { [key in Category]: symbol }
);

/**
 * controller
 */
export type Config = {
  [key: symbol]: wagmi.Config;
  readonly connectors: readonly wagmi.Connector[];
};

export function createConfig({
  evm,
  ...rest
}: {
  evm: wagmi.CreateConfigParameters<any, any>;
  solana?: unknown;
}): Config {
  const result: Config = {
    get connectors() {
      return result[uniqueKeys.evm]?.connectors || [];
    },
  };
  if (evm) {
    const wagmiConfig = wagmi.createConfig(evm);
    result[uniqueKeys.evm] = wagmiConfig;
  }
  // TODO: implement other categories
  return result;
}

/**
 * number if it's a EVM chain otherwise string
 */
export type ChainIdOrName = number | string;

export function connect(
  config: Config,
  {
    chain,
    wallet,
    category: _category,
  }: { chain?: ChainIdOrName; category?: Category; wallet: string }
) {
  let category = _category;
  if (!category) {
    if (!chain) {
      throw new Error("Must specify chain or category");
    }
    category = chainToCategory(chain);
  }
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
        throw new Error(`Can't find connector for ${chain}`);
      }
      return wagmi.connect(wagmiConfig, { connector });
    }
    default:
      throw new Error("not implemented");
  }
}

export function disconnect(config: Config, chain: ChainIdOrName) {
  const category = chainToCategory(chain);
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

export function getChain(config: Config, category: Category): ChainIdOrName {
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      return wagmi.getChainId(wagmiConfig);
    }
    default:
      throw new Error("not implemented");
  }
}

export function getAccount(config: Config, chain: ChainIdOrName) {
  const category = chainToCategory(chain);
  switch (category) {
    case "evm": {
      const wagmiConfig = config[uniqueKeys.evm];
      if (!wagmiConfig) {
        throw new Error("No config found for evm");
      }
      return wagmi.getChainId(wagmiConfig);
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
  chain: ChainIdOrName,
  payload: { message: string }
) {
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
      return wagmi.signMessage(wagmiConfig, payload);
    }
    default:
      throw new Error("not implemented");
  }
}

export function sendTransaction(
  config: Config,
  chain: ChainIdOrName,
  payload: {
    to: any;
    value: any;
  }
) {
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
      return wagmi.sendTransaction(wagmiConfig, {
        ...payload,
        chainId: chain,
      });
    }
    default:
      throw new Error("not implemented");
  }
}

export function watchAccount(
  config: Config,
  {
    onChange,
  }: {
    onChange(account: any, preAccount: any): void;
  }
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

// 目前代码里面没有用到，暂时不实现
// export function watchChain(config: Config) {}

// 目前代码里面没有用到，暂时不实现
// export function watchConnection(config: Config) {}

// ─── Internal Methods ────────────────────────────────────────────────────────
function chainToCategory(chain: ChainIdOrName): Category {
  if (typeof chain === "number") return "evm";
  throw new Error(`unknown chain ${chain}`);
}

// ─────────────────────────────────────────────────────────────────────────────

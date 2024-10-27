import { useCallback, useEffect, useMemo, useState } from "react";
import { configParams } from "./wagmi";
import { connect, disconnect, createConfig, watchAccount } from "./owlto";
import { GetAccountReturnType } from "wagmi/actions";

const config = createConfig({
  evm: configParams,
});
function App() {
  const [account, setAccount] = useState<GetAccountReturnType>();

  const connectors = config.connectors;

  useEffect(() => {
    const unwatch = watchAccount(config, {
      onChange(account, preAccount) {
        setAccount(account);
      },
    });
    return () => {
      unwatch();
    };
  }, []);

  const disconnectFn = useCallback(() => {
    if (!account) return;
    disconnect(config, account.chainId!);
  }, [account]);

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account?.status}
          <br />
          addresses: {JSON.stringify(account?.addresses)}
          <br />
          chainId: {account?.chainId}
        </div>

        {account?.status === "connected" && (
          <button type="button" onClick={() => disconnectFn()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() =>
              connect(config, {
                category: "evm",
                wallet: connector.name,
              }).catch((e) => {
                console.error(e);
              })
            }
            type="button"
          >
            {connector.name}
          </button>
        ))}
        {/* <div>{status}</div> */}
        {/* <div>{error?.message}</div> */}
      </div>
    </>
  );
}

export default App;

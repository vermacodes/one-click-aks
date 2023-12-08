import { useContext, useState } from "react";
import { FaChevronDown, FaRedo } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAccount, useSetAccount } from "../../../hooks/useAccount";
import { useResetServerCache } from "../../../hooks/useServerCache";
import { WebSocketContext } from "../../Context/WebSocketContext";
import Button from "../../UserInterfaceComponents/Button";

export default function AzureSubscription() {
  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>(false);
  const { data: accounts, isLoading: accountsLoading } = useAccount();

  const { mutate: setAccount } = useSetAccount();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutateAsync: resetServerCacheAsync } = useResetServerCache();

  function handleResetServerCache() {
    const response = toast.promise(resetServerCacheAsync(), {
      pending: "Resetting Server Cache...",
      success: "Server Cache Reset.",
      error: {
        render(data: any) {
          return `Failed to reset server cache. ${data.data.response.data.error}`;
        },
      },
    });

    response.finally(() => {
      window.location.reload();
    });
  }

  return (
    <div className="flex gap-2">
      <div className="relative inline-block text-left">
        <div
          className={`${
            actionStatus.inProgress && "text-slate-500 "
          } flex w-96 items-center justify-between rounded border border-slate-500 p-2`}
          onClick={(e) => {
            !actionStatus.inProgress && setSubscriptionMenu(!subscriptionMenu);
            e.stopPropagation();
          }}
        >
          {accountsLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {accounts?.map((account) => (
                <div key={account.id}>
                  {account.isDefault === true && <p>{account.name}</p>}
                </div>
              ))}
            </>
          )}
          <p>
            <FaChevronDown />
          </p>
        </div>
        <div
          className={`absolute right-0 z-10 mt-2 h-56 w-96 origin-top-right overflow-y-auto scrollbar overflow-x-hidden ${
            !subscriptionMenu && "hidden"
          } items-center gap-y-2 rounded border bg-slate-100 p-2 dark:bg-slate-800`}
          onMouseLeave={() => setSubscriptionMenu(false)}
        >
          {accountsLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {accounts?.map((account) => (
                <div
                  key={account.id}
                  className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100"
                  onClick={() => {
                    setSubscriptionMenu(!subscriptionMenu);
                    !actionStatus.inProgress && setAccount(account);
                  }}
                >
                  {account.isDefault !== true && <>{account.name}</>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <Button
        variant="secondary-text"
        disabled={actionStatus.inProgress}
        tooltipMessage="Reset Server Cache"
        tooltipDelay={200}
        onClick={handleResetServerCache}
      >
        <FaRedo />
      </Button>
    </div>
  );
}

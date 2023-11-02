import { FaChevronDown, FaRedo } from "react-icons/fa";
import { useAccount, useSetAccount } from "../../../hooks/useAccount";
import { useContext, useState } from "react";
import { WebSocketContext } from "../../../WebSocketContext";
import Button from "../../UserInterfaceComponents/Button";
import { useResetServerCache } from "../../../hooks/useServerCache";

export default function AzureSubscription() {
  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>(false);
  const { data: accounts, isLoading: accountsLoading } = useAccount();

  const { mutate: setAccount } = useSetAccount();
  const { actionStatus } = useContext(WebSocketContext);
  const { mutateAsync: resetServerCacheAsync } = useResetServerCache();

  return (
    <div className="relative inline-block text-left">
      <div className="flex gap-2">
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
                <>
                  {account.isDefault === true && (
                    <div key={account.id}>
                      <p>{account.name}</p>
                    </div>
                  )}
                </>
              ))}
            </>
          )}
          <p>
            <FaChevronDown />
          </p>
        </div>

        <Button
          variant="secondary-outline"
          disabled={actionStatus.inProgress}
          onClick={() =>
            resetServerCacheAsync().finally(() => {
              window.location.reload();
            })
          }
        >
          <FaRedo />
        </Button>
      </div>
      <div
        className={`absolute right-0 z-10 mt-2 h-56 w-96 origin-top-right overflow-y-auto overflow-x-hidden scrollbar ${
          !subscriptionMenu && "hidden"
        } items-center gap-y-2 rounded border bg-slate-100 p-2 dark:bg-slate-800`}
        onMouseLeave={() => setSubscriptionMenu(false)}
      >
        {accountsLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {accounts?.map((account) => (
              <div key={account.id}>
                {account.isDefault !== true && (
                  <div
                    className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100"
                    onClick={() => {
                      setSubscriptionMenu(!subscriptionMenu);
                      !actionStatus.inProgress && setAccount(account);
                    }}
                  >
                    {account.name}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

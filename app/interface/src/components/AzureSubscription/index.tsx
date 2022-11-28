import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useAccount, useSetAccount } from "../../hooks/useAccount";
type Props = {
  subscriptionMenu: boolean;
  setSubscriptionMenu(args: boolean): void;
};

export default function AzureSubscription({
  subscriptionMenu,
  setSubscriptionMenu,
}: Props) {
  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAccount();

  const { mutate: setAccount } = useSetAccount();

  return (
    <div>
      <div className="w-100 flex items-center justify-between space-x-2 space-x-reverse py-2">
        <h2 className="text-lg">Azure Subscription</h2>
        <div className="relative inline-block text-left">
          <div
            className="roundedd flex w-96 items-center justify-between border border-slate-500 p-2"
            onClick={(e) => {
              setSubscriptionMenu(!subscriptionMenu);
              e.stopPropagation();
            }}
          >
            {accountsLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                {accounts?.map((account) => (
                  <>{account.isDefault === true && <p>{account.name}</p>}</>
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
            } roundedd items-center space-y-2 border bg-slate-100 p-2 dark:bg-slate-800`}
          >
            {accountsLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                {accounts?.map((account) => (
                  <>
                    {account.isDefault !== true && (
                      <div
                        className="roundedd items-center p-2 hover:bg-sky-500 hover:text-slate-100"
                        onClick={() => setAccount(account)}
                      >
                        {account.name}
                      </div>
                    )}
                  </>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

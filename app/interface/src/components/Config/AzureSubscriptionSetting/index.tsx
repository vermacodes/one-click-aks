import { useEffect, useState } from "react";
import { useAccount } from "../../../hooks/useAccount";
import Container from "../../UserInterfaceComponents/Container";

export default function AzureSubscriptionSetting() {
  const [defaultAccount, setDefaultAccount] = useState<string>("Loading...");
  const { data: accounts } = useAccount();

  useEffect(() => {
    if (accounts) {
      accounts.forEach((account) => {
        if (account.isDefault) {
          setDefaultAccount(account.name);
        }
      });
    }
  }, [accounts]);

  return (
    <Container title="Azure Subscription" collapsible={true}>
      <div className="flex w-full flex-col gap-2 gap-x-2 py-2">
        {/* <AzureSubscription /> */}
        <div className="w-full rounded border border-slate-500 p-2">
          {defaultAccount}
        </div>
        <p className="text-xs">
          To change the subscription, re-deploy the server in the new
          subscription and make sure the endpoint is updated.
        </p>
      </div>
    </Container>
  );
}

import { useState } from "react";
import AzureSubscription from "../../components/AzureSubscription";
import Button from "../../components/Button";
import Terminal from "../../components/Terminal";
import { useLogin, useLoginStatus } from "../../hooks/useAccount";
import { useSetLogs } from "../../hooks/useLogs";

type Props = { section: string; setSection(args: string): void };

export default function Subscription({ section, setSection }: Props) {
  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>(false);
  const loginStatus = useLoginStatus();
  const { refetch: login, isLoading: loginLoading } = useLogin();
  const { mutate: setLogs } = useSetLogs();

  return (
    <section className={`${section !== "subscription" && "hidden"} `}>
      <div
        className="flex flex-col justify-center space-y-12"
        onClick={() => setSubscriptionMenu(false)}
      >
        <h1 className="text-center text-9xl">Subscription ☁️</h1>
        <p className="text-3xl text-slate-500">
          Ok, select your lab subscription that you would want this tool to
          configure storage account in and deploy resources to. After selection,
          hit "Next".
        </p>
        <AzureSubscription
          subscriptionMenu={subscriptionMenu}
          setSubscriptionMenu={setSubscriptionMenu}
        />
        <div className="flex justify-between">
          <Button variant="primary" onClick={() => setSection("login")}>
            {"< Previous"}
          </Button>
          <Button
            variant="primary"
            disabled={!(loginStatus.data !== undefined && loginStatus.data)}
            onClick={() => setSection("storage")}
          >
            {"Next >"}
          </Button>
        </div>
      </div>
    </section>
  );
}

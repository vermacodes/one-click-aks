import { useAccount } from "../../../hooks/useAccount";
import { useServerStatus } from "../../../hooks/useServerStatus";

export default function NoSubscriptionsFound() {
  const { data: serverStatus } = useServerStatus();
  const {
    data: accounts,
    refetch: getAccounts,
    isLoading: accountsLoading,
    isFetching: accountsFetching,
  } = useAccount();

  if (
    (accounts && accounts?.length > 0) ||
    accountsLoading ||
    accountsFetching
  ) {
    return null;
  }

  if (serverStatus?.status !== "OK") {
    return null;
  }

  return (
    <div className="z-5 mt-2 rounded border border-yellow-500 bg-yellow-500 bg-opacity-20 p-2">
      <strong>⚠️ No Subscriptions Found:</strong> No Azure Subscriptions were
      loaded.{" "}
      <a
        href="#"
        onClick={() => getAccounts()}
        className="cursor-pointer text-sky-600 underline"
      >
        Refetch
      </a>{" "}
      now. Use Help & Feedback if the problem continues.
    </div>
  );
}

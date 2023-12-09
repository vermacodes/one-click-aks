import { useServerStatus } from "../../../hooks/useServerStatus";
import {
  useConfigureStorageAccount,
  useGetStorageAccount,
} from "../../../hooks/useStorageAccount";

export default function StorageAccountNotConfigured() {
  const { data: serverStatus } = useServerStatus();
  const {
    data: storageAccount,
    isLoading: getStorageAccountLoading,
    isFetching: fetchingStorageAccount,
  } = useGetStorageAccount();

  const {
    refetch: configureStorageAccount,
    isLoading: configureStorageAccountLoading,
  } = useConfigureStorageAccount();

  if (serverStatus?.status !== "OK") {
    return null;
  }

  if (
    configureStorageAccountLoading ||
    getStorageAccountLoading ||
    fetchingStorageAccount ||
    (storageAccount && storageAccount.storageAccount.name !== "")
  ) {
    return null;
  }

  return (
    <div className="z-5 mt-2 rounded border border-yellow-500 bg-yellow-500 bg-opacity-20 p-2">
      <strong>⚠️ Storage Account Issue Detected:</strong> It seems storage
      account is not configured.{" "}
      <a
        href="#"
        onClick={() => configureStorageAccount()}
        className="cursor-pointer text-sky-600 underline"
      >
        Configure
      </a>{" "}
      now. Use Help & Feedback if the problem continues.
    </div>
  );
}

import {
  useConfigureStorageAccount,
  useGetStorageAccount,
} from "../../hooks/useStorageAccount";
type Props = {};

export default function StorageAccount({}: Props) {
  const {
    data: storageAccount,
    isLoading: getStorageAccountLoading,
    isError: getStorageAccountError,
  } = useGetStorageAccount();

  const {
    refetch: configureStorageAccount,
    isLoading: configureStorageAccountLoading,
    isError: configureStorageAccountError,
  } = useConfigureStorageAccount();

  return (
    <div>
      <div className="w-100 flex items-center justify-between space-x-2 space-x-reverse py-2">
        <h2 className="text-lg">Storage Account</h2>
        {storageAccount && storageAccount.storageAccount.name !== "" ? (
          <p>{storageAccount.storageAccount.name}</p>
        ) : (
          <button
            className="text-bold rounded-2xl bg-sky-500 py-1 px-5 text-white hover:bg-sky-700"
            onClick={() => configureStorageAccount()}
            disabled={configureStorageAccountLoading}
          >
            {configureStorageAccountLoading ? "Working..." : "Configure"}
          </button>
        )}
      </div>
      <div className="flex justify-end">
        <p className="w-2/4 text-right text-xs text-slate-700 dark:text-slate-300">
          Your persistant data like terraform state and configurations are
          stored in this account. You will find this in a resource group named
          'repro-project' in your subscription mentioned below. Before you
          configure, make sure your lab subscription is selected.
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-300"></p>
      </div>
    </div>
  );
}

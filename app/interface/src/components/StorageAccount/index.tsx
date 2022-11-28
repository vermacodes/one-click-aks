import {
  useConfigureStorageAccount,
  useGetStorageAccount,
} from "../../hooks/useStorageAccount";
import Button from "../Button";
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
          <Button
            variant="primary"
            onClick={() => configureStorageAccount()}
            disabled={configureStorageAccountLoading}
          >
            {configureStorageAccountLoading ? "Working..." : "Configure"}
          </Button>
        )}
      </div>
      <div className="flex flex-col">
        <p className="text-xs text-slate-700 dark:text-slate-300">
          - Your persistant data like terraform state and configurations are
          stored in this account. You will find this in a resource group named
          'repro-project' in your subscription mentioned below.
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-300">
          - Before you configure, make sure your lab subscription is selected.
        </p>
      </div>
    </div>
  );
}

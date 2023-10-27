import {
  useConfigureStorageAccount,
  useGetStorageAccount,
} from "../../../hooks/useStorageAccount";
import SettingsItemLayout from "../../../layouts/SettingsItemLayout";
import Button from "../../UserInterfaceComponents/Button";
type Props = {};

export default function StorageAccount({}: Props) {
  const {
    data: storageAccount,
    isLoading: getStorageAccountLoading,
    isFetching: fetchingStorageAccount,
    isError: getStorageAccountError,
  } = useGetStorageAccount();

  const {
    refetch: configureStorageAccount,
    isLoading: configureStorageAccountLoading,
    isError: configureStorageAccountError,
  } = useConfigureStorageAccount();

  return (
    <SettingsItemLayout>
      <div className="w-100 gap-x-reverse flex items-center justify-between gap-x-2 py-2">
        <h2 className="text-lg">Storage Account</h2>
        {fetchingStorageAccount || getStorageAccountLoading ? (
          <p>Please wait..</p>
        ) : (
          <>
            {storageAccount && storageAccount.storageAccount.name !== "" ? (
              <p className="h-10 items-center rounded border border-slate-500 px-3 py-1">
                {storageAccount.storageAccount.name}
              </p>
            ) : (
              <Button
                variant="primary"
                onClick={() => configureStorageAccount()}
                disabled={configureStorageAccountLoading}
              >
                {configureStorageAccountLoading ? "Working..." : "Configure"}
              </Button>
            )}
          </>
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
    </SettingsItemLayout>
  );
}

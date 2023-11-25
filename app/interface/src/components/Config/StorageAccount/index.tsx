import {
  useConfigureStorageAccount,
  useGetStorageAccount,
} from "../../../hooks/useStorageAccount";
import Button from "../../UserInterfaceComponents/Button";
import Container from "../../UserInterfaceComponents/Container";
type Props = {};

export default function StorageAccount({}: Props) {
  const {
    data: storageAccount,
    isLoading: getStorageAccountLoading,
    isFetching: fetchingStorageAccount,
  } = useGetStorageAccount();

  const {
    refetch: configureStorageAccount,
    isLoading: configureStorageAccountLoading,
  } = useConfigureStorageAccount();

  return (
    <Container title="Storage Account" collapsible={true}>
      <div className="flex flex-col gap-2">
        <div className="flex w-full justify-end gap-2">
          {fetchingStorageAccount || getStorageAccountLoading ? (
            <p>Please wait..</p>
          ) : (
            <>
              {storageAccount && storageAccount.storageAccount.name !== "" ? (
                <p className="h-10 w-full items-center rounded border border-slate-500 p-2">
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
            Your persistent data like terraform state and configurations are
            stored in this account. You will find this in a resource group named
            'repro-project' in your subscription mentioned below.
          </p>
        </div>
      </div>
    </Container>
  );
}

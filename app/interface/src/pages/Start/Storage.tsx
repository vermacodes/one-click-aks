import { Link } from "react-router-dom";
import Button from "../../components/Button";
import {
  useConfigureStorageAccount,
  useGetStorageAccount,
} from "../../hooks/useStorageAccount";

type Props = { section: string; setSection(args: string): void };

export default function Storage({ section, setSection }: Props) {
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
    isFetching: configureStorageAccountFetching,
  } = useConfigureStorageAccount();

  const storageIsSetup = (
    <div>
      <p className="text-3xl text-slate-500">
        Great 👏. Storage is setup now! ⏭️ Next step is to create a service
        principal and store its credentials in a key vault 🔑. Hit 'Next' to go
        to Service Principal and start finish that last thing.
      </p>
    </div>
  );
  const storageIsNotSetup = (
    <div className="flex flex-col items-center space-y-6">
      <p className="text-3xl text-slate-500">
        Like any other app in the world 🌍. We need to store data too. 💾. And
        we store that for you in a storage account in your subscription, that
        only you have access to. 🔑
      </p>
      <p className="text-3xl text-slate-500">
        All we need is that you have exactly one storage account in a resource
        group named 'repro-project' and contains a Container called 'tfstate'.
        Either you can do that manually or use 'Configure Storge' button below
        to do that automagically 🪄.
      </p>
      <div className="flex w-60 flex-col justify-center">
        <Button
          variant="success"
          disabled={
            configureStorageAccountLoading ||
            configureStorageAccountFetching ||
            fetchingStorageAccount ||
            getStorageAccountLoading
          }
          onClick={() => configureStorageAccount()}
        >
          {configureStorageAccountLoading ||
          configureStorageAccountFetching ||
          fetchingStorageAccount ||
          getStorageAccountLoading
            ? "Please wait..."
            : "Configure Storage"}
        </Button>
      </div>
    </div>
  );
  return (
    <section className={`${section !== "storage" && "hidden"} `}>
      <div className="flex flex-col justify-center space-y-12">
        <h1 className="text-center text-8xl">Storage 💾</h1>
        {storageAccount && storageAccount.storageAccount.name !== ""
          ? storageIsSetup
          : storageIsNotSetup}
        <div className="flex justify-between">
          <Button variant="primary" onClick={() => setSection("subscription")}>
            {"← Previous"}
          </Button>
          <Button
            variant="primary"
            disabled={
              storageAccount && storageAccount.storageAccount.name === ""
            }
            onClick={() => {
              setSection("service-principal");
            }}
          >
            {"Next →"}
          </Button>
        </div>
      </div>
    </section>
  );
}

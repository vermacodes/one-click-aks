import { useState } from "react";
import { MdClose } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import {
  useConfigureStorageAccount,
  useGetStorageAccount,
} from "../../hooks/useStorageAccount";
import { useAccount } from "../../hooks/useAccount";
type SettingsProps = {
  showModal: boolean;
  setShowModal(args: boolean): void;
};

export default function Settings({ showModal, setShowModal }: SettingsProps) {
  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>();
  const [regionMenu, setRegionMenu] = useState<boolean>(false);

  const { data: storageAccount } = useGetStorageAccount();
  const { data: account } = useAccount();
  const {
    refetch: configureStorageAccount,
    isLoading: configureStorageInProgress,
  } = useConfigureStorageAccount();

  if (!showModal) return null;
  return (
    <div
      className="max-w-ful fixed inset-0 flex max-h-full justify-center bg-slate-900 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
        setSubscriptionMenu(false);
        setRegionMenu(false);
      }}
    >
      <div
        className=" my-20 w-3/4 space-y-2 divide-y divide-slate-300 rounded bg-slate-100 p-5 dark:divide-slate-700 dark:bg-slate-900"
        onClick={(e) => {
          e.stopPropagation();
          setSubscriptionMenu(false);
          setRegionMenu(false);
        }}
      >
        <div className="w-100 flex justify-between pb-2 ">
          <h1 className="text-3xl">Settings</h1>
          <button
            onClick={() => setShowModal(false)}
            className="hover:text-sky-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>

        {/* Storage Account */}
        <div>
          <div className="w-100 flex items-center justify-between space-x-2 space-x-reverse py-2">
            <h2 className="text-lg">Storage Account</h2>
            {storageAccount && storageAccount.storageAccount.name !== "" ? (
              <p>{storageAccount.storageAccount.name}</p>
            ) : (
              <button
                className="text-bold rounded-2xl bg-sky-500 py-1 px-5 text-white hover:bg-sky-700"
                onClick={() => configureStorageAccount()}
                disabled={configureStorageInProgress}
              >
                {configureStorageInProgress ? "Working..." : "Configure"}
              </button>
            )}
          </div>
          <div className="flex justify-end">
            <p className="w-2/4 text-right text-xs text-slate-700 dark:text-slate-300">
              Your persistant data like terraform state and configurations are
              stored in this account. You will find this in a resource group
              named 'repro-project' in your subscription mentioned below. Before
              you configure, make sure your lab subscription is selected.
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300"></p>
          </div>
        </div>

        {/* Azure Subscription */}
        <div>
          <div className="w-100 flex items-center justify-between space-x-2 space-x-reverse py-2">
            <h2 className="text-lg">Azure Subscription</h2>
            <div className="relative inline-block text-left">
              <div
                className="flex w-96 items-center justify-between rounded border p-2"
                onClick={(e) => {
                  setSubscriptionMenu(!subscriptionMenu);
                  e.stopPropagation();
                }}
              >
                <p>{account.name}</p>
                <p>
                  <FaChevronDown />
                </p>
              </div>
              <div
                className={`scrollbar absolute right-0 z-10 mt-2 h-56 w-96 origin-top-right overflow-y-auto overflow-x-hidden ${
                  !subscriptionMenu && "hidden"
                } items-center space-y-2 rounded border bg-slate-100 p-2 dark:bg-slate-800`}
              >
                <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100">
                  Another Subscription
                </div>
                <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100">
                  Another Subscription
                </div>
                <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100">
                  Another Subscription
                </div>
                <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100">
                  Another Subscription
                </div>
                <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100">
                  Another Subscription
                </div>
                <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100">
                  Another Subscription
                </div>
                <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100">
                  Loremipsumdolorsitametconsecteturadipisicingelit.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Azure Region */}
        <div className="w-100 flex items-center justify-between space-x-2 space-x-reverse py-2">
          <h2 className="text-lg">Azure Region</h2>
          <div className="relative inline-block text-left">
            <div
              className="flex w-96 items-center justify-between rounded border p-2"
              onClick={(e) => {
                setRegionMenu(!regionMenu);
                e.stopPropagation();
              }}
            >
              <p>East US</p>
              <p>
                <FaChevronDown />
              </p>
            </div>
            <div
              className={`scrollbar absolute right-0 mt-2 h-56 w-96 origin-top-right overflow-y-auto overflow-x-hidden ${
                !regionMenu && "hidden"
              } items-center space-y-2 rounded border bg-slate-100 p-2 dark:bg-slate-800`}
            >
              <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 ">
                West US
              </div>
              <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 ">
                Central US
              </div>
              <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 ">
                Another Region
              </div>
              <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 ">
                Another Region
              </div>
              <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 ">
                Another Region
              </div>
              <div className="items-center rounded p-2 hover:bg-sky-500 hover:text-slate-100 ">
                Another Region
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

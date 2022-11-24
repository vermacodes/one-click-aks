import { useState } from "react";
import { MdClose } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { useConfigureStorageAccount, useGetStorageAccount } from "../../hooks/useStorageAccount";
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
    const { refetch: configureStorageAccount, isLoading: configureStorageInProgress } = useConfigureStorageAccount();

    if (!showModal) return null;
    return (
        <div
            className="fixed inset-0 max-h-full max-w-ful bg-slate-900 dark:bg-slate-100 dark:bg-opacity-80 flex justify-center"
            onClick={() => {
                setShowModal(false);
                setSubscriptionMenu(false);
                setRegionMenu(false);
            }}
        >
            <div
                className=" w-3/4 p-5 rounded bg-slate-100 dark:bg-slate-900 my-20 space-y-2 divide-y divide-slate-300 dark:divide-slate-700"
                onClick={(e) => {
                    e.stopPropagation();
                    setSubscriptionMenu(false);
                    setRegionMenu(false);
                }}
            >
                <div className="flex w-100 justify-between pb-2 ">
                    <h1 className="text-3xl">Settings</h1>
                    <button onClick={() => setShowModal(false)} className="hover:text-sky-500">
                        <MdClose className="text-3xl" />
                    </button>
                </div>

                {/* Storage Account */}
                <div>
                    <div className="flex justify-between items-center w-100 py-2 space-x-reverse space-x-2">
                        <h2 className="text-lg">Storage Account</h2>
                        {storageAccount && storageAccount.storageAccount.name !== "" ? (
                            <p>{storageAccount.storageAccount.name}</p>
                        ) : (
                            <button
                                className="bg-sky-500 py-1 px-5 rounded-2xl text-bold text-white hover:bg-sky-700"
                                onClick={() => configureStorageAccount()}
                                disabled={configureStorageInProgress}
                            >
                                {configureStorageInProgress ? "Working..." : "Configure"}
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <p className="w-2/4 text-xs text-right text-slate-700 dark:text-slate-300">
                            Your persistant data like terraform state and configurations are stored in this account. You
                            will find this in a resource group named 'repro-project' in your subscription mentioned
                            below. Before you configure, make sure your lab subscription is selected.
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300"></p>
                    </div>
                </div>

                {/* Azure Subscription */}
                <div>
                    <div className="flex justify-between items-center w-100 py-2 space-x-reverse space-x-2">
                        <h2 className="text-lg">Azure Subscription</h2>
                        <div className="relative inline-block text-left">
                            <div
                                className="flex justify-between items-center border p-2 rounded w-96"
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
                                className={`origin-top-right absolute right-0 mt-2 w-96 h-56 z-10 overflow-x-hidden overflow-y-auto scrollbar ${
                                    !subscriptionMenu && "hidden"
                                } border p-2 rounded items-center bg-slate-100 dark:bg-slate-800 space-y-2`}
                            >
                                <div className="p-2 items-center hover:bg-sky-500 hover:text-slate-100 rounded">
                                    Another Subscription
                                </div>
                                <div className="p-2 items-center hover:bg-sky-500 hover:text-slate-100 rounded">
                                    Another Subscription
                                </div>
                                <div className="p-2 items-center hover:bg-sky-500 hover:text-slate-100 rounded">
                                    Another Subscription
                                </div>
                                <div className="p-2 items-center hover:bg-sky-500 hover:text-slate-100 rounded">
                                    Another Subscription
                                </div>
                                <div className="p-2 items-center hover:bg-sky-500 hover:text-slate-100 rounded">
                                    Another Subscription
                                </div>
                                <div className="p-2 items-center hover:bg-sky-500 hover:text-slate-100 rounded">
                                    Another Subscription
                                </div>
                                <div className="p-2 items-center hover:bg-sky-500 hover:text-slate-100 rounded">
                                    Loremipsumdolorsitametconsecteturadipisicingelit.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Azure Region */}
                <div className="flex justify-between items-center w-100 py-2 space-x-reverse space-x-2">
                    <h2 className="text-lg">Azure Region</h2>
                    <div className="relative inline-block text-left">
                        <div
                            className="flex justify-between items-center border p-2 rounded w-96"
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
                            className={`origin-top-right absolute right-0 mt-2 w-96 h-56 overflow-x-hidden overflow-y-auto scrollbar ${
                                !regionMenu && "hidden"
                            } border p-2 rounded items-center bg-slate-100 dark:bg-slate-800 space-y-2`}
                        >
                            <div className="p-2 rounded items-center hover:bg-sky-500 hover:text-slate-100 ">
                                West US
                            </div>
                            <div className="p-2 rounded items-center hover:bg-sky-500 hover:text-slate-100 ">
                                Central US
                            </div>
                            <div className="p-2 rounded items-center hover:bg-sky-500 hover:text-slate-100 ">
                                Another Region
                            </div>
                            <div className="p-2 rounded items-center hover:bg-sky-500 hover:text-slate-100 ">
                                Another Region
                            </div>
                            <div className="p-2 rounded items-center hover:bg-sky-500 hover:text-slate-100 ">
                                Another Region
                            </div>
                            <div className="p-2 rounded items-center hover:bg-sky-500 hover:text-slate-100 ">
                                Another Region
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

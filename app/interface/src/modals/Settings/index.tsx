import { useState } from "react";
import { MdClose } from "react-icons/md";
import AzureRegion from "../../components/AzureRegion";
import AzureSubscription from "../../components/AzureSubscription";
import AuthServiceEndpoint from "../../components/Config/AuthServiceEndpoint";
import ServerEndpoint from "../../components/Config/ServerEndpoint";
import EndLogStream from "../../components/EndLogStream";
import ResetActionStatus from "../../components/ResetActionStatus";
import ResetServerCache from "../../components/ResetServerCache";
import StorageAccount from "../../components/StorageAccount";
import TfInit from "../../components/TfInit";
import TfWorkspace from "../../components/TfWorkspace";
type SettingsProps = {
  showModal: boolean;
  setShowModal(args: boolean): void;
};

export default function Settings({ showModal, setShowModal }: SettingsProps) {
  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>(false);
  const [regionEdit, setRegionEdit] = useState<boolean>(false);
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);
  //If something breaks down dont return anything.
  if (!showModal) {
    return null;
  }

  return (
    <div
      className="max-w-ful fixed inset-0 flex max-h-full justify-center bg-slate-900 dark:bg-slate-100 dark:bg-opacity-80"
      onClick={() => {
        setShowModal(false);
        setSubscriptionMenu(false);
        setRegionEdit(false);
        setWorkspaceMenu(false);
      }}
    >
      <div
        className=" my-20 w-3/4 gap-y-2 divide-y divide-slate-300 overflow-auto rounded bg-slate-100 p-5 scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-sky-500 dark:divide-slate-700 dark:bg-slate-900"
        onClick={(e) => {
          e.stopPropagation();
          setSubscriptionMenu(false);
          setRegionEdit(false);
          setWorkspaceMenu(false);
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
        <StorageAccount />
        <AzureSubscription
          subscriptionMenu={subscriptionMenu}
          setSubscriptionMenu={setSubscriptionMenu}
        />
        <AzureRegion regionEdit={regionEdit} setRegionEdit={setRegionEdit} />
        {/* <TfInit />
        <TfWorkspace
          workspaceMenu={workspaceMenu}
          setWorkspaceMenu={setWorkspaceMenu}
        /> */}

        <div className="flex">
          <ResetActionStatus />
          <ResetServerCache />
          <ServerEndpoint />
          <AuthServiceEndpoint />
        </div>
      </div>
    </div>
  );
}

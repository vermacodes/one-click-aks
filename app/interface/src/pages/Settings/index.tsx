import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import AzureRegion from "../../components/AzureRegion";
import AzureSubscription from "../../components/AzureSubscription";
import AuthServiceEndpoint from "../../components/Config/AuthServiceEndpoint";
import ServerEndpoint from "../../components/Config/ServerEndpoint";
import ResetActionStatus from "../../components/ResetActionStatus";
import ResetServerCache from "../../components/ResetServerCache";
import StorageAccount from "../../components/StorageAccount";
import TfInit from "../../components/TfInit";
import TfWorkspace from "../../components/TfWorkspace";

export default function Settings() {
  const [copy, setCopy] = useState<boolean>(false);
  const dockerCommand =
    "docker run --pull=always -d -it -p 8880:80 actlab.azurecr.io/repro";

  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>(false);
  const [regionEdit, setRegionEdit] = useState<boolean>(false);
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);

  function handleCommandCopy() {
    navigator.clipboard.writeText(dockerCommand);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 3000);
  }

  return (
    <div className="flex flex-col gap-x-4">
      <p className="mb-6 border-b-2 border-slate-500 py-4 text-4xl">Settings</p>
      <div className="space-y-10 divide-y divide-slate-500">
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

        <TfInit />
        <TfWorkspace
          workspaceMenu={workspaceMenu}
          setWorkspaceMenu={setWorkspaceMenu}
        />
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

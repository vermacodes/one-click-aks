import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import AzureRegion from "../../components/AzureRegion";
import AzureSubscription from "../../components/AzureSubscription";
import ServerEndpoint from "../../components/Config/ServerEndpoint";
import ResetActionStatus from "../../components/ResetActionStatus";
import ResetServerCache from "../../components/ResetServerCache";
import StorageAccount from "../../components/StorageAccount";
import TfInit from "../../components/TfInit";
import TfWorkspace from "../../components/TfWorkspace";

export default function Settings() {
  const [copy, setCopy] = useState<boolean>(false);
  const dockerCommand =
    "docker run --pull=always -d -it -p 8080:8080 actlab.azurecr.io/repro";

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
    <div className="my-3 mx-20 mb-2 space-y-10 divide-y divide-slate-500">
      <div className="w-100 flex justify-between pb-2 ">
        <h1 className="text-3xl">Settings</h1>
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

      <TfInit />
      <TfWorkspace
        workspaceMenu={workspaceMenu}
        setWorkspaceMenu={setWorkspaceMenu}
      />
      <div className="flex">
        <ResetActionStatus />
        <ResetServerCache />
        <ServerEndpoint />
      </div>
    </div>
  );
}

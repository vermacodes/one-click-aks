import { useState } from "react";
import AzureRegion from "../../components/AzureRegion";
import AzureSubscription from "../../components/AzureSubscription";
import AuthServiceEndpoint from "../../components/Config/AuthServiceEndpoint";
import ServerEndpoint from "../../components/Config/ServerEndpoint";
import ResetActionStatus from "../../components/ResetActionStatus";
import ResetServerCache from "../../components/ResetServerCache";
import StorageAccount from "../../components/StorageAccount";
import TfInit from "../../components/TfInit";
import TfWorkspace from "../../components/TfWorkspace";
import PageLayout from "../../layouts/PageLayout";

export default function Settings() {
  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>(false);
  const [regionEdit, setRegionEdit] = useState<boolean>(false);
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);

  return (
    <PageLayout heading="Settings">
      <div className="space-y-10 divide-y divide-slate-500">
        <StorageAccount />
        <AzureSubscription
          subscriptionMenu={subscriptionMenu}
          setSubscriptionMenu={setSubscriptionMenu}
        />
        <AzureRegion regionEdit={regionEdit} setRegionEdit={setRegionEdit} />

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
    </PageLayout>
  );
}

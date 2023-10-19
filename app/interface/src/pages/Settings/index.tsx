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
import SettingsItemLayout from "../../layouts/SettingsItemLayout";
import WebSocketEndpoint from "../../components/Config/WebSocketEndpoint";

export default function Settings() {
  const [subscriptionMenu, setSubscriptionMenu] = useState<boolean>(false);
  const [regionEdit, setRegionEdit] = useState<boolean>(false);
  const [workspaceMenu, setWorkspaceMenu] = useState<boolean>(false);

  return (
    <PageLayout heading="Settings">
      <div className="mb-4 flex flex-col gap-4">
        <ServerEndpoint />
        {/* <WebSocketEndpoint /> */}
        <AuthServiceEndpoint />
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
        <SettingsItemLayout>
          <div className="flex">
            <ResetActionStatus />
            <ResetServerCache />
          </div>
        </SettingsItemLayout>
      </div>
    </PageLayout>
  );
}

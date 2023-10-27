import { useState } from "react";
import AzureRegion from "../../components/Config/AzureRegion";
import AuthServiceEndpoint from "../../components/Config/AuthServiceEndpoint";
import ServerEndpoint from "../../components/Config/ServerEndpoint";
import ResetActionStatus from "../../components/Config/ResetActionStatus";
import ResetServerCache from "../../components/Config/ResetServerCache";
import StorageAccount from "../../components/Config/StorageAccount";
import TfInit from "../../components/Config/TerraformInit";
import Workspace from "../../components/Terraform/Workspace";
import PageLayout from "../../layouts/PageLayout";
import SettingsItemLayout from "../../layouts/SettingsItemLayout";
import AzureSubscriptionSetting from "../../components/Config/AzureSubscriptionSetting";

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
        <AzureSubscriptionSetting />
        <AzureRegion regionEdit={regionEdit} setRegionEdit={setRegionEdit} />

        <TfInit />
        <Workspace
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

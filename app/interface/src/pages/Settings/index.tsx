import { useEffect, useState } from "react";
import AzureRegion from "../../components/Config/AzureRegion";
import AuthServiceEndpoint from "../../components/Config/AuthServiceEndpoint";
import ServerEndpoint from "../../components/Config/ServerEndpoint";
import ResetActionStatus from "../../components/Config/ResetActionStatus";
import ResetServerCache from "../../components/Config/ResetServerCache";
import StorageAccount from "../../components/Config/StorageAccount";
import TerraformInit from "../../components/Config/TerraformInit";
import TerraformWorkspaces from "../../components/Config/TerraformWorkspaces";
import PageLayout from "../../layouts/PageLayout";
import SettingsItemLayout from "../../layouts/SettingsItemLayout";
import AzureSubscriptionSetting from "../../components/Config/AzureSubscriptionSetting";
import ServerStatus from "../../components/Config/ServerStatus";

export default function Settings() {
  useEffect(() => {
    document.title = "ACT Labs | Settings";
  }, []);

  return (
    <PageLayout heading="Settings">
      <div className="mb-4 flex flex-col gap-4">
        <ServerStatus />
        <ServerEndpoint />
        {/* <WebSocketEndpoint /> */}
        <AuthServiceEndpoint />
        <StorageAccount />
        <AzureSubscriptionSetting />
        <AzureRegion />

        <TerraformInit />
        <TerraformWorkspaces />
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

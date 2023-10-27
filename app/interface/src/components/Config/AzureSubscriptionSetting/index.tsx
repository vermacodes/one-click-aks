import SettingsItemLayout from "../../../layouts/SettingsItemLayout";
import AzureSubscription from "../AzureSubscription";

export default function AzureSubscriptionSetting() {
  return (
    <SettingsItemLayout>
      <div className="w-100 gap-x-reverse flex items-center justify-between gap-x-2 py-2">
        <h2 className="text-lg">Azure Subscription</h2>
        <AzureSubscription />
      </div>
    </SettingsItemLayout>
  );
}

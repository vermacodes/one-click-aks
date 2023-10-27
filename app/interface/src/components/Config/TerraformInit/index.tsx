import SettingsItemLayout from "../../../layouts/SettingsItemLayout";
import InitButton from "../../Terraform/ActionButtons/InitButton";

type Props = {};

export default function TerraformInit({}: Props) {
  return (
    <SettingsItemLayout>
      <div className="flex items-center justify-between py-2">
        <h2 className="text-lg">Initialize Terraform</h2>
        <InitButton variant="primary">Terraform Init</InitButton>
      </div>
      <div className="flex flex-col">
        <p className="text-xs text-slate-700 dark:text-slate-300">
          - Terraform is auto initialized after login. But if you see issues,
          use this to initialize again.
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-300"></p>
      </div>
    </SettingsItemLayout>
  );
}

import { SiTerraform } from "react-icons/si";
import { DeploymentType } from "../../dataStructures";
import Checkbox from "../Checkbox";
import Button from "../Button";

type Props = {
  deployment: DeploymentType;
};

export default function Deployment({ deployment }: Props) {
  function handleAutoDeleteChange() {}

  function handleAddDeployment(args: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      className={`mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div className="flex justify-between">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          <h1 className="text-xl text-sky-500">
            {deployment.deploymentWorkspace}
          </h1>
        </div>
        <div className="flex flex-wrap gap-y-2 gap-x-2">
          <Checkbox
            id="auto-delete"
            label="Auto Delete"
            checked={deployment.deploymentAutoDelete}
            handleOnChange={handleAutoDeleteChange}
            disabled={false}
          />
          <div
            className={`flex w-32 items-center justify-between rounded border border-slate-500 px-2 py-1`}
          >
            8 Hours
          </div>
          <Button
            variant="primary-text"
            disabled={deployment.deploymentWorkspace === "dev"}
            onClick={handleAddDeployment}
          >
            Select
          </Button>
          <Button variant="danger-text">Delete</Button>
        </div>
      </div>
    </div>
  );
}

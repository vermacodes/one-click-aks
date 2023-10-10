import Button from "../Button";
import Checkbox from "../Checkbox";
import {
  useSelectedTerraformWorkspace,
  useTerraformWorkspace,
} from "../../hooks/useWorkspace";
import { SiTerraform } from "react-icons/si";
import {
  useAddDeployment,
  useGetMyDeployments,
  useUpsertDeployment,
} from "../../hooks/useDeployments";
import { useLab } from "../../hooks/useLab";
import { DeploymentType } from "../../dataStructures";
import { Link } from "react-router-dom";
import AddTerraformWorkspace from "../AddTerraformWorkspace";

export default function SelectedDeployment() {
  const { data: lab } = useLab();
  const { data: terraformWorkspace } = useTerraformWorkspace();
  const { data: selectedTerraformWorkspace } = useSelectedTerraformWorkspace();
  const { data: deployments } = useGetMyDeployments();
  const { mutate: addDeployment } = useAddDeployment();
  const { mutateAsync: asyncUpsertDeployment } = useUpsertDeployment();

  function handleAutoDeleteChange(deployment: DeploymentType) {
    asyncUpsertDeployment({
      ...deployment,
      deploymentAutoDelete: !deployment.deploymentAutoDelete,
    });
  }
  function handleAddDeployment() {
    var selectedTerraformWorkspace = terraformWorkspace?.find(
      (workspace) => workspace.selected === true
    );

    if (lab != undefined && selectedTerraformWorkspace != undefined) {
      var newDeployment: DeploymentType = {
        deploymentId: "",
        deploymentUserId: "",
        deploymentWorkspace: selectedTerraformWorkspace?.name,
        deploymentAutoDelete: false,
        deploymentAutoDeleteUnixTime: 0,
        deploymentStatus: "notstarted",
        deploymentLab: lab,
      };

      addDeployment(newDeployment);
    }
  }

  if (
    terraformWorkspace === undefined ||
    lab === undefined ||
    deployments === undefined
  ) {
    return <></>;
  }

  return (
    <div
      className={`mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      {deployments &&
        deployments.map(
          (deployment: DeploymentType) =>
            deployment.deploymentWorkspace ===
              selectedTerraformWorkspace?.name && (
              <div
                className="flex justify-between"
                key={deployment.deploymentId}
              >
                <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
                  <h1 className="text-xl">
                    <SiTerraform />
                  </h1>
                  <h1 className="text-2xl text-sky-500">
                    <div>
                      {selectedTerraformWorkspace &&
                        selectedTerraformWorkspace.name}
                    </div>
                  </h1>
                  {/* <CurrentTerraformWorkspace /> */}
                </div>
                <div className="flex flex-wrap gap-y-2 gap-x-2">
                  <Checkbox
                    id="auto-delete"
                    label="Auto Delete"
                    checked={deployment.deploymentAutoDelete}
                    handleOnChange={() => handleAutoDeleteChange(deployment)}
                    disabled={false}
                  />
                  <div
                    className={`flex w-32 items-center justify-between rounded border border-slate-500 px-2 py-1`}
                  >
                    8 Hours
                  </div>
                  <Button variant="primary-text" onClick={handleAddDeployment}>
                    Add
                  </Button>
                  <AddTerraformWorkspace />
                  <Link to={"/deployments"}>
                    <Button variant="secondary-text">View All</Button>
                  </Link>
                </div>
              </div>
            )
        )}
    </div>
  );
}

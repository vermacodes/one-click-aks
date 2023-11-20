import { useContext, useEffect, useState } from "react";
import { ButtonVariant, DeploymentType } from "../../../dataStructures";
import { useTerraformWorkspace } from "../../../hooks/useWorkspace";
import Button from "../../UserInterfaceComponents/Button";
import { WebSocketContext } from "../../Context/WebSocketContext";
import { useSelectDeployment } from "../../../hooks/useDeployments";
import { useGetSelectedTerraformWorkspace } from "../../../hooks/useGetSelectedTerraformWorkspace";
import { useQueryClient } from "react-query";
import { useSelectedDeployment } from "../../../hooks/useSelectedDeployment";
import PleaseWaitModal from "../../UserInterfaceComponents/Modal/PleaseWaitModal";

type SelectDeploymentProps = {
  variant: ButtonVariant;
  deployment: DeploymentType;
};

export default function SelectDeployment({
  variant,
  deployment,
}: SelectDeploymentProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const { actionStatus } = useContext(WebSocketContext);
  const { data: workspaces } = useTerraformWorkspace();
  const { mutateAsync: asyncSelectDeployment } = useSelectDeployment();
  const { selectedTerraformWorkspace } = useGetSelectedTerraformWorkspace();
  const { selectedDeployment } = useSelectedDeployment();
  const queryClient = useQueryClient();

  if (workspaces === undefined) {
    return (
      <Button variant={variant} disabled={true}>
        Select
      </Button>
    );
  }

  useEffect(() => {
    if (
      selectedDeployment?.deploymentWorkspace === deployment.deploymentWorkspace
    ) {
      setModalMessage("✅ All done.");
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    }
  }, [selectedDeployment]);

  return (
    <>
      <Button
        variant={variant}
        disabled={
          deployment.deploymentWorkspace === selectedTerraformWorkspace?.name ||
          actionStatus === undefined ||
          actionStatus.inProgress === true
        }
        onClick={() => {
          setModalMessage("⌛ Selecting deployment, Please wait...");
          setShowModal(true);

          asyncSelectDeployment(deployment)
            .then(() => {
              setModalMessage("⌛ Almost done. Please wait...");
              queryClient.invalidateQueries(["list-deployments"]);

              setTimeout(() => {
                setModalMessage("❌ Failed to get latest state.");
                setTimeout(() => {
                  setShowModal(false);
                }, 5000);
              }, 60000);
            })
            .catch(() => {
              setModalMessage("c❌ Failed to select deployment.");
              setTimeout(() => {
                setShowModal(false);
              }, 5000);
            });
        }}
      >
        Select
      </Button>
      {showModal && <PleaseWaitModal modalMessage={modalMessage} />}
    </>
  );
}

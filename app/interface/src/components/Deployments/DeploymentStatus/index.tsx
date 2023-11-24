import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { DeploymentType } from "../../../dataStructures";

type Props = {
  deployment: DeploymentType;
};

export default function DeploymentStatus({ deployment }: Props) {
  return (
    <div className={`flex items-center gap-2`}>
      {deployment.deploymentStatus === "Deployment Failed" ||
      deployment.deploymentStatus === "Destroy Failed" ? (
        <p className="text-rose-500">
          <FaExclamationCircle />
        </p>
      ) : (
        <p className="text-green-500">
          <FaCheckCircle />
        </p>
      )}
      {deployment.deploymentStatus}
    </div>
  );
}

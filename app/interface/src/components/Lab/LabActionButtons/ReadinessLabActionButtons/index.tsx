import { FaArrowRight, FaEdit } from "react-icons/fa";
import { Lab } from "../../../../dataStructures";
import ApplyButton from "../../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../../Terraform/ActionButtons/DestroyButton";
import PlanButton from "../../../Terraform/ActionButtons/PlanButton";
import Button from "../../../UserInterfaceComponents/Button";
import SaveLabButton from "../../SaveLab/SaveLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import DeleteLabButton from "../../DeleteLabButton";
import { useState } from "react";
import ExtendButton from "../../../Terraform/ActionButtons/ExtendButton";
import CreateAssignment from "../../Assignment/CreateAssignment";

type Props = {
  lab: Lab;
};

export default function ReadinessLabActionButtons({ lab }: Props) {
  const [more, setMore] = useState<string>("");

  function handleShowMore(lab: Lab) {
    if (more !== lab.id) {
      setMore(lab.id);
    } else {
      setMore("");
    }
  }
  return (
    <>
      <div className="flex w-full flex-col justify-between gap-2">
        <div className="flex justify-between gap-2">
          <CreateAssignment lab={lab} />
          <div
            className={`${
              more === lab.id && "rotate-90"
            } transition-all duration-500`}
          >
            <Button variant="primary-icon" onClick={() => handleShowMore(lab)}>
              <FaArrowRight />
            </Button>
          </div>
        </div>
        <div
          className={`${
            lab.id === more ? "max-h-40" : "max-h-0"
          } flex flex-wrap justify-between gap-1 gap-x-1 overflow-hidden transition-all duration-500`}
        >
          <PlanButton variant="success-text" lab={lab}>
            Plan
          </PlanButton>
          <ApplyButton variant="primary-text" lab={lab}>
            Deploy
          </ApplyButton>
          <ExtendButton
            lab={lab}
            variant="secondary-text"
            mode="extend-validate"
          >
            Validate
          </ExtendButton>
          <DestroyButton variant="danger-text" lab={lab}>
            Destroy
          </DestroyButton>
          <SaveLabButton lab={lab} variant="secondary-text">
            <FaEdit /> Edit
          </SaveLabButton>
          <LoadToBuilderButton variant="secondary-text" lab={lab}>
            Open
          </LoadToBuilderButton>
          <DeleteLabButton lab={lab} variant="danger-text">
            Delete
          </DeleteLabButton>
        </div>
      </div>
    </>
  );
}

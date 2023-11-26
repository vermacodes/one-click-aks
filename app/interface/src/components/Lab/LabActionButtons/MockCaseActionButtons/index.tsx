import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Lab } from "../../../../dataStructures";
import ApplyButton from "../../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../../Terraform/ActionButtons/DestroyButton";
import PlanButton from "../../../Terraform/ActionButtons/PlanButton";
import Button from "../../../UserInterfaceComponents/Button";
import DeleteLabButton from "../../DeleteLabButton";
import ExportLabButton from "../../Export/ExportLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import SaveLabButton from "../../SaveLab/SaveLabButton";

type Props = {
  lab: Lab;
};

export default function MockCaseActionButtons({ lab }: Props) {
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex justify-start gap-2">
          <PlanButton variant="primary" lab={lab}>
            Plan
          </PlanButton>
          <ApplyButton variant="primary-outline" lab={lab}>
            Deploy
          </ApplyButton>
          <DestroyButton variant="danger-text" lab={lab}>
            Destroy
          </DestroyButton>
        </div>
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
        <ExportLabButton lab={lab} variant="secondary-text">
          Export
        </ExportLabButton>
        <SaveLabButton lab={lab} variant="secondary-text">
          Edit
        </SaveLabButton>
        <LoadToBuilderButton variant="secondary-text" lab={lab}>
          Open
        </LoadToBuilderButton>
        <DeleteLabButton lab={lab} variant="danger-text">
          Delete
        </DeleteLabButton>
      </div>
    </>
  );
}

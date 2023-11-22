import { FaCheck, FaTrash } from "react-icons/fa";
import { Lab } from "../../../../dataStructures";
import ApplyButton from "../../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../../Terraform/ActionButtons/DestroyButton";
import ExtendButton from "../../../Terraform/ActionButtons/ExtendButton";

type Props = {
  lab: Lab;
};

export default function AssignmentActionButtons({ lab }: Props) {
  return (
    <div className="flex justify-start gap-1">
      <ApplyButton variant="primary" lab={lab}>
        Deploy
      </ApplyButton>
      <ExtendButton lab={lab} variant="secondary-text" mode="extend-validate">
        <FaCheck /> Validate
      </ExtendButton>
      <DestroyButton variant="danger-text" lab={lab}>
        Destroy
      </DestroyButton>
    </div>
  );
}

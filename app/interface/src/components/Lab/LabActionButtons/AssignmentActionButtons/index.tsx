import { Lab } from "../../../../dataStructures";
import ApplyButton from "../../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../../Terraform/ActionButtons/DestroyButton";
import ValidateLabButton from "../../ValidateLabButton";

type Props = {
  lab: Lab;
};

export default function AssignmentActionButtons({ lab }: Props) {
  return (
    <div className="flex justify-start gap-1">
      <ApplyButton variant="primary" lab={lab}>
        Deploy
      </ApplyButton>
      <ValidateLabButton lab={lab} variant="secondary-text">
        Validate
      </ValidateLabButton>
      <DestroyButton variant="danger-text" lab={lab}>
        Destroy
      </DestroyButton>
    </div>
  );
}

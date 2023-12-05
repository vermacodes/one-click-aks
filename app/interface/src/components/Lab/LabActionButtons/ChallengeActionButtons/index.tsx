import { FaCheck } from "react-icons/fa";
import { Lab } from "../../../../dataStructures";
import ApplyButton from "../../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../../Terraform/ActionButtons/DestroyButton";
import ExtendButton from "../../../Terraform/ActionButtons/ExtendButton";

type Props = {
  lab: Lab;
};

export default function ChallengeActionButtons({ lab }: Props) {
  return (
    <div className="flex justify-start gap-1">
      <ApplyButton variant="primary-outline" lab={lab}>
        Deploy
      </ApplyButton>
      <ExtendButton lab={lab} variant="success-outline" mode="extend-validate">
        <FaCheck /> Validate
      </ExtendButton>
      <DestroyButton variant="danger-outline" lab={lab}>
        Destroy
      </DestroyButton>
    </div>
  );
}

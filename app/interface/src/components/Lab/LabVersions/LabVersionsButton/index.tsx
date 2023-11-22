import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { Link } from "react-router-dom";
import { FaHistory } from "react-icons/fa";

type Props = {
  variant?: ButtonVariant;
  lab: Lab;
};

export default function LabVersionsButton({
  variant = "secondary-text",
  lab,
}: Props) {
  return (
    <Link to={"/lab/versions/" + lab.type + "/" + lab.id}>
      <Button variant={variant}>
        <FaHistory /> Versions
      </Button>
    </Link>
  );
}

import { saveAs } from "file-saver";
import { useLab } from "../../hooks/useLab";
import Button from "../Button";

type Props = {
  variant:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "primary-outline"
    | "secondary-outline"
    | "danger-outline"
    | "success-outline"
    | "primary-outline-animate";
  children?: React.ReactNode;
};

export default function index({ variant, children }: Props) {
  const { data: lab } = useLab();
  function handleDownload() {
    const jsonString = JSON.stringify(lab, null, 4);
    var name = "lab.json";
    if (lab != undefined && lab.name != "") {
      name = lab.name + ".json";
    }
    saveAs(new Blob([jsonString], { type: "application/json" }), name);
  }

  return (
    <Button variant={variant} onClick={handleDownload}>
      {children}
    </Button>
  );
}

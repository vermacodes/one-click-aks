import { saveAs } from "file-saver";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import Button from "../../../Button";

type Props = {
  variant: ButtonVariant;
  lab: Lab;
  children: React.ReactNode;
};

export default function ExportLabButton({ variant, lab, children }: Props) {
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

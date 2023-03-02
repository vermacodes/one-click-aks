import { saveAs } from "file-saver";
import { FaDownload } from "react-icons/fa";
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
    <button
      className={`flex items-center gap-3 rounded py-1 px-3 text-lg hover:bg-sky-500 hover:bg-opacity-20`}
      onClick={handleDownload}
    >
      <span>
        <FaDownload />
      </span>
      {children}
    </button>
  );
}

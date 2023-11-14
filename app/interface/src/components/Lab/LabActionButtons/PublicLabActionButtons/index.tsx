import { FaShare } from "react-icons/fa";
import { Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import ExportLabButton from "../../Export/ExportLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import { useState } from "react";
import { toast } from "react-toastify";

type Props = {
  lab: Lab;
};

export default function PublicLabActionButtons({ lab }: Props) {
  const [copied, setCopied] = useState(false);

  function copyLinkToLab(lab: Lab) {
    navigator.clipboard.writeText(
      `${window.location.origin}/lab/sharedtemplate/${lab.id}`
    );

    toast.success("Link copied to clipboard.", {
      autoClose: 1000,
      toastId: "copy-link-to-lab",
    });

    // Set copied to true for 2 seconds
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="flex justify-start gap-2">
      <LoadToBuilderButton lab={lab} variant="primary">
        Open
      </LoadToBuilderButton>
      <ExportLabButton lab={lab} variant="secondary-text">
        Export
      </ExportLabButton>
      <Button
        variant={`${copied ? "success-text" : "secondary-text"}`}
        onClick={() => copyLinkToLab(lab)}
      >
        <span>
          <FaShare />
        </span>
        {copied ? "Done" : "Share"}
      </Button>
    </div>
  );
}

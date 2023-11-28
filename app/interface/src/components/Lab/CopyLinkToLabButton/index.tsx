import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { ButtonVariant, Lab } from "../../../dataStructures";
import Button from "../../UserInterfaceComponents/Button";

type Props = {
  lab: Lab;
  variant?: ButtonVariant;
  successVariant?: ButtonVariant;
  children?: React.ReactNode;
};

export default function CopyLinkToLabButton({
  lab,
  variant = "secondary-text",
  successVariant = "success",
  children,
}: Props) {
  const [copied, setCopied] = useState(false);
  const copyLinkToLab = useCallback((lab: Lab) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/lab/${lab.type}/${lab.id}`
    );
    setCopied(true);
    toast.success("Link copied to clipboard.", {
      autoClose: 1000,
      toastId: "copy-link-to-lab",
    });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, []);

  return (
    <Button
      variant={copied ? successVariant : variant}
      onClick={() => copyLinkToLab(lab)}
    >
      {children}
    </Button>
  );
}

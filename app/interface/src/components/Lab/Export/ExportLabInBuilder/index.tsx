import React from "react";
import { ButtonVariant } from "../../../../dataStructures";
import { useLab } from "../../../../hooks/useLab";
import ExportLabButton from "../ExportLabButton";

type Props = {
  variant: ButtonVariant;
  children: React.ReactNode;
};

export default function ExportLabInBuilder({ variant, children }: Props) {
  const { data: lab } = useLab();

  if (lab === undefined) {
    return <></>;
  }

  return (
    <ExportLabButton lab={lab} variant={variant}>
      {children}
    </ExportLabButton>
  );
}

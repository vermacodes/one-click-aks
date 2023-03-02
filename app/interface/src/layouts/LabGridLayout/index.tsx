import React from "react";

type Props = {
  children?: React.ReactNode;
};

export default function LabGridLayout({ children }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {children}
    </div>
  );
}

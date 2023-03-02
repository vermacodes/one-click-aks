import React from "react";

type Props = {
  title: string;
  details?: React.ReactNode;
  children?: React.ReactNode;
};

export default function ConfigLayout({ children }: Props) {
  return <div>ConfigLayout</div>;
}

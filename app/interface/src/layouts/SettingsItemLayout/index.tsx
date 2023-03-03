import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function SettingsItemLayout({ children }: Props) {
  return (
    <div className="rounded bg-slate-50 py-2 px-4 shadow dark:bg-slate-900">
      {children}
    </div>
  );
}

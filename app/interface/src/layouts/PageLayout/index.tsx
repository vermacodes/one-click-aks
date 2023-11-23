import { useState } from "react";
import Detectors from "../../components/Detectors/Detectors";
import DarkModeSwitch from "../../components/UserInterfaceComponents/DarkModeSwitch";
import { useDefaultAccount } from "../../hooks/useDefaultAccount";
import { useGlobalStateContext } from "../../components/Context/GlobalStateContext";

type Props = {
  heading?: string;
  children: React.ReactNode;
};

export default function PageLayout({ heading, children }: Props) {
  const { darkMode, setDarkMode } = useGlobalStateContext();
  // const { defaultAccount } = useDefaultAccount();
  return (
    <div>
      <Detectors />
      {heading !== undefined && (
        <div
          className={`${
            heading !== "" ? "mb-4 border-b-2 border-slate-500 py-4 " : "mt-6 "
          } flex items-center justify-between `}
        >
          <h1 className="text-4xl">{heading}</h1>
          {/* <div className="text-sm text-slate-500">
            {defaultAccount ? defaultAccount.name : ""}
          </div> */}
          <DarkModeSwitch
            handleOnChange={() => setDarkMode(!darkMode)}
            label=""
            id="darkModeSwitch"
            checked={darkMode}
          />
        </div>
      )}
      {children}
    </div>
  );
}

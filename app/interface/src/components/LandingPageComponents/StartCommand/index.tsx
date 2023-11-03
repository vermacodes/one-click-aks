import { useState } from "react";
import { MdDoneOutline, MdOutlineContentCopy } from "react-icons/md";

type Props = {};

export default function StartCommand({}: Props) {
  const bashCommand =
    "curl -o actlabs.sh -sLO https://aka.ms/ACTLabStart; chmod +x actlabs.sh; ./actlabs.sh; rm actlabs.sh";
  const powershellCommand = "Please help us create powershell command.";

  const [copy, setCopy] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("bash");
  const [command, setCommand] = useState<string>(bashCommand);

  function handleCommandCopy() {
    navigator.clipboard.writeText(command);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 2000);
  }

  return (
    <div
      className={`flex w-full flex-col gap-4 rounded border-slate-300 bg-slate-900 text-slate-50 dark:border-slate-700 dark:bg-slate-900 ${
        copy
          ? "border-green-500 bg-green-700 bg-opacity-80 dark:bg-green-700"
          : "border-slate-400 dark:border-slate-600"
      }`}
    >
      <div className="flex items-center justify-between gap-4 py-2 px-4 text-xl">
        <div className="flex justify-start gap-4 text-xl">
          <button
            className={`${
              language === "bash"
                ? "border-sky-500 text-sky-500"
                : "border-transparent"
            } " border-slate-500" border-b-2`}
            onClick={() => {
              setLanguage("bash");
              setCommand(bashCommand);
            }}
          >
            Bash
          </button>
          <button
            className={`${
              language === "powershell"
                ? "border-sky-500 text-sky-500"
                : "border-transparent"
            } " border-slate-500" border-b-2`}
            onClick={() => {
              setLanguage("powershell");
              setCommand(powershellCommand);
            }}
          >
            PowerShell
          </button>
        </div>
        <div>
          <button className="text-2xl" onClick={() => handleCommandCopy()}>
            {copy ? (
              <MdDoneOutline />
            ) : (
              <MdOutlineContentCopy className="hover:text-sky-500" />
            )}
          </button>
        </div>
      </div>
      <div className={`inline-flex justify-between gap-x-5 py-2 px-6`}>
        <p className="font-mono text-lg">$ {command}</p>
      </div>
    </div>
  );
}

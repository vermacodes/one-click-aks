import { useState } from "react";
import { MdDoneOutline, MdOutlineContentCopy } from "react-icons/md";

type Props = {};

export default function StartCommand({}: Props) {
  const bashCommand =
    "docker run --pull=always -d -it -p 8880:80 actlab.azurecr.io/repro";
  const powershellCommand = "Please help us create powershell command.";

  const [copy, setCopy] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("bash");
  const [command, setCommand] = useState<string>(bashCommand);

  function handleCommandCopy() {
    navigator.clipboard.writeText(command);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 3000);
  }

  return (
    <div
      className={`flex w-full flex-col gap-4 rounded border-2 border-slate-500 bg-slate-300 dark:border-slate-500 dark:bg-slate-700 ${
        copy
          ? "border-green-500 bg-green-200 dark:bg-green-700"
          : "border-slate-700 dark:border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-4 py-2 px-4 text-xl">
        <div className="flex justify-start gap-4 text-xl">
          <button
            className={`${
              language === "bash"
                ? "border-sky-500 text-sky-500"
                : "border-transparent"
            } " border-slte-500" border-b-2`}
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
        <h3 className="font-mono text-xl">$ {command}</h3>
      </div>
    </div>
  );
}

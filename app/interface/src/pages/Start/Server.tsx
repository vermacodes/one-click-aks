import { useState } from "react";
import { MdDoneOutline, MdOutlineContentCopy } from "react-icons/md";
import Button from "../../components/Button";
import { useServerStatus } from "../../hooks/useServerStatus";

type Props = { section: string; setSection(args: string): void };

export default function Server({ section, setSection }: Props) {
  const [copy, setCopy] = useState<boolean>(false);
  const dockerCommand = "docker run -d -it -p 8080:8080 ashishvermapu/repro";

  const { data, isError, isFetching, isLoading } = useServerStatus();

  function handleCommandCopy() {
    navigator.clipboard.writeText(dockerCommand);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 3000);
  }

  const serverNotRunning = (
    <>
      <p className="text-3xl text-slate-500">
        The brains 🧠 of this tool needs to be run in a docker container 🐋. All
        you need to do is install docker and run our server locally on your
        machine 💻.
      </p>
      <p className="text-3xl text-slate-500">
        How to install docker? I dont know.. ask Internet. After you've done
        that, copy the command below and run in your favourite CLI and come back
        to this page.
      </p>
      <div
        className={`flex justify-between  gap-x-5 rounded-xl border-2 bg-slate-300 py-2 px-6 dark:bg-slate-700 ${
          copy
            ? "border-green-500 bg-green-200 dark:bg-green-700"
            : "border-slate-700 dark:border-slate-200"
        }`}
      >
        <h3 className="font-mono text-xl">$ {dockerCommand}</h3>
        <button className="text-2xl" onClick={() => handleCommandCopy()}>
          {copy ? (
            <MdDoneOutline />
          ) : (
            <MdOutlineContentCopy className="hover:text-sky-500" />
          )}
        </button>
      </div>
    </>
  );

  const serverRunning = (
    <div>
      <p className="text-3xl text-slate-500">
        Great 👏. Server is now running. Hit 'Next' to continue.
      </p>
    </div>
  );

  return (
    <section className={`${section !== "server" && "hidden"} `}>
      <div className="flex flex-col justify-center space-y-12">
        <h1 className="text-center text-9xl">Server 🖥️</h1>
        {data && data.status == "OK" ? serverRunning : serverNotRunning}
        <div className="flex justify-end">
          <Button
            variant="primary"
            disabled={!(data && data.status == "OK")}
            onClick={() => setSection("login")}
          >
            {"Next >"}
          </Button>
        </div>
      </div>
    </section>
  );
}

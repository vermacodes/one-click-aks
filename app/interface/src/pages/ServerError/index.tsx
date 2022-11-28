import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";

export default function ServerError() {
  const [copy, setCopy] = useState<boolean>(false);
  const dockerCommand = "docker run -d -it -p 8080:8080 ashishvermapu/repro";

  function handleCommandCopy() {
    navigator.clipboard.writeText(dockerCommand);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 3000);
  }

  return (
    <div className="my-3 mx-20 mb-2 space-y-10 text-center">
      <h1 className="text-6xl text-red-600">Server Error</h1>
      <p className="text-3xl text-slate-500">
        It seems the server is not running. You need to install docker and run
        our server locally on your machine or run it in cloud and configure
        endpoint in settings.
      </p>

      <div
        className={`roundedd-xl inline-flex  justify-between space-x-5 border-2 bg-slate-300 py-2 px-6 dark:bg-slate-700 ${
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
    </div>
  );
}

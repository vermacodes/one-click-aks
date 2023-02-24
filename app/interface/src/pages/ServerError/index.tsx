import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";
import { Link } from "react-router-dom";

export default function ServerError() {
  const [copy, setCopy] = useState<boolean>(false);
  const dockerCommand =
    "docker run --pull=always -d -it -p 8880:80 actlab.azurecr.io/repro";

  function handleCommandCopy() {
    navigator.clipboard.writeText(dockerCommand);
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 3000);
  }

  return (
    <div className="my-3 mx-20 mb-2 space-y-10">
      <h1 className="text-8xl text-rose-600">Server Error</h1>
      <p className="text-3xl text-slate-500">
        It seems the server is not running ☹️. You need to install docker and
        run server using command below 👇. If you are new here, use 'Get
        Started' button to setup.
      </p>

      <div className="flex gap-x-10">
        <Link to={"/start"}>
          <button className="rounded-full border-2 border-transparent bg-sky-500 py-2 px-10 text-2xl text-white hover:border-2 hover:border-sky-500 hover:bg-inherit hover:text-sky-500">
            Get Started
          </button>
        </Link>
        <div
          className={`inline-flex justify-between  gap-x-5 rounded-xl border-2 bg-slate-300 py-2 px-6 dark:bg-slate-700 ${
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
    </div>
  );
}

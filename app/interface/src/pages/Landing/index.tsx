import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";

export default function Landing() {
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
    <div className="my-4 mt-5 space-y-10 px-20">
      <h1 className="py-10 text-8xl font-bold">Head start your lab repros.</h1>
      <p className="text-3xl text-slate-500">
        All you need to do is install docker and run our server locally on your
        machine or run it in cloud and configure endpoint.
      </p>
      <div className="flex space-x-10">
        <button className="rounded-full border-2 border-transparent bg-sky-500 py-2 px-10 text-2xl text-white hover:border-2 hover:border-sky-500 hover:bg-inherit hover:text-sky-500">
          Learn More
        </button>
        <div
          className={`flex justify-between  space-x-5 rounded-xl border-2 bg-slate-300 py-2 px-6 dark:bg-slate-700 ${
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

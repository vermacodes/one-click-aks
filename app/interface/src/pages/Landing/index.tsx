import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";

export default function Landing() {
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
    <PageLayout>
      <h1 className="py-10 text-8xl font-bold">Head start your lab repros.</h1>
      <p className="pb-20 text-3xl text-slate-500">
        All you need to do is install docker 🐋, run server locally on your
        computer 💻 and configure a storage account 💾 in your Azure
        subscription. To begin, hit 'Get started' button below 👇.
      </p>
      <div className="flex gap-x-10">
        <Link to={"/start"}>
          <button className="rounded-full border-2 border-transparent bg-sky-500 py-2 px-10 text-white hover:border-2 hover:border-sky-500 hover:bg-inherit hover:text-sky-500 md:text-base xl:text-2xl">
            Get Started
          </button>
        </Link>
        <div
          className={`flex items-center justify-between gap-x-5 rounded-xl border-2 bg-slate-300 py-2 px-6 dark:bg-slate-700 ${
            copy
              ? "border-green-500 bg-green-200 dark:bg-green-700"
              : "border-slate-700 dark:border-slate-200"
          }`}
        >
          <h3 className="font-mono md:text-sm xl:text-2xl">
            $ {dockerCommand}
          </h3>
          <button className="text-2xl" onClick={() => handleCommandCopy()}>
            {copy ? (
              <MdDoneOutline />
            ) : (
              <MdOutlineContentCopy className="hover:text-sky-500" />
            )}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}

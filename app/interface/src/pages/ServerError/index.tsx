import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import StartCommand from "../../components/StartCommand";
import PageLayout from "../../layouts/PageLayout";

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
    <PageLayout heading="Server Error">
      <div className="flex flex-col gap-4">
        <p className="text-3xl text-slate-500">
          It seems the server is not running ☹️. You need to install docker and
          run server using command below 👇. If you are new here, use 'Get
          Started' button to setup.
        </p>

        <div className="flex gap-10">
          <Link to={"/start"}>
            <button className="rounded-full border-2 border-transparent bg-sky-500 py-2 px-10 text-2xl text-white hover:border-2 hover:border-sky-500 hover:bg-inherit hover:text-sky-500">
              Get Started
            </button>
          </Link>
          <StartCommand />
        </div>
      </div>
    </PageLayout>
  );
}

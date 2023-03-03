import { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import Button from "../../components/Button";
import DeployWebAppCommand from "../../components/DeployWebAppCommand";
import StartCommand from "../../components/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function Landing() {
  const [showStartCommand, setShowStartCommand] = useState<boolean>(false);

  return (
    <PageLayout>
      <div className="my-10 flex flex-col gap-10">
        <div className="flex h-[75%] flex-col py-10">
          <h1 className="text-8xl font-bold">Head start your lab repros.</h1>
          <p className="pt-10 text-3xl text-slate-500">
            Build and deploy labs in minutes ⌚. Get a head start with labs
            built and tested by AKS Ninjas. 🥷
          </p>
          <div className="flex gap-8 pt-32 text-2xl">
            <Button variant="primary" onClick={() => setShowStartCommand(true)}>
              Get Started
            </Button>
            <a
              href="https://actlabsdocs.z13.web.core.windows.net/docs/introduction"
              target={"_blank"}
            >
              <Button variant="secondary-outline">Learn More</Button>
            </a>
          </div>
        </div>
        <div
          className={` ${
            !showStartCommand && "hidden "
          } " gap-10" flex flex-col`}
        >
          {/* <Link to={"/start"}>
          <button className="rounded-full border-2 border-transparent bg-sky-500 py-2 px-10 text-white hover:border-2 hover:border-sky-500 hover:bg-inherit hover:text-sky-500 md:text-base xl:text-2xl">
            Get Started
          </button>
        </Link> */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl">Run on Docker</h3>
            <StartCommand />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl">Deploy as WebApp</h3>
            <DeployWebAppCommand />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

import { FaExternalLinkAlt } from "react-icons/fa";
import Button from "../../components/Button";
import DeployWebAppCommand from "../../components/DeployWebAppCommand";
import StartCommand from "../../components/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function Landing() {
  return (
    <PageLayout>
      <div className="my-10 flex flex-col gap-10">
        <div className="flex h-[75%] flex-col items-center py-10">
          <h1 className="text-8xl font-bold">Head start your lab repros.</h1>
          <p className="pt-10 text-3xl text-slate-500">
            Build and deploy labs in minutes ⌚. Get a head start with labs
            built and tested by angels. 😇
          </p>
          <div className="pt-32 text-2xl">
            <a
              href="https://actlabsdocs.z13.web.core.windows.net/docs/getting-started"
              target={"_blank"}
              className="rounded bg-purple-500 py-2 px-8 text-slate-100 outline outline-purple-500 hover:bg-purple-600 hover:outline-purple-600"
            >
              Get Started
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-10">
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

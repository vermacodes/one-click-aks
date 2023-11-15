import { useEffect } from "react";
import DeployWebAppCommand from "../../components/LandingPageComponents/DeployWebAppCommand";
import StartCommand from "../../components/LandingPageComponents/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function ServerError() {
  useEffect(() => {
    document.title = "ACT Labs | Server Error";
  }, []);

  return (
    <PageLayout heading="Server Error">
      <div className="flex flex-col gap-8 pb-12">
        <p className="text-3xl text-rose-500">Error: Server Not Reachable 😟</p>
        <p className="text-2xl text-slate-500">
          This part of ACT Labs require server to be running. But, it seems the
          server is not running.{" "}
        </p>
        <p className="text-2xl text-slate-500">
          <a
            href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849282/Getting-Started"
            target={"_blank"}
            className="text-sky-500 underline"
          >
            Learn more
          </a>{" "}
          about deploying configuring the server. If you already know the drill,
          then, quick deploy using either of the following options.
        </p>
      </div>
      <div className={`mb-20 flex flex-col gap-10`}>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl">Run on Docker</h3>
          <StartCommand />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl">Deploy as WebApp</h3>
          <DeployWebAppCommand />
        </div>
      </div>

      <p className="text-2xl text-slate-500">
        <span className="font-bold">Is this not helpful?</span>{" "}
        <a
          href="https://forms.office.com/r/R513F2YfXE"
          target={"_blank"}
          className="text-green-500 underline"
        >
          Please share feedback.
        </a>
      </p>
    </PageLayout>
  );
}

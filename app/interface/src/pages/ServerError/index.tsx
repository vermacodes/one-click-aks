import { useState } from "react";
import Button from "../../components/Button";
import DeployWebAppCommand from "../../components/DeployWebAppCommand";
import StartCommand from "../../components/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function ServerError() {
  const [showStartCommand, setShowStartCommand] = useState<boolean>(false);
  return (
    <PageLayout heading="Server Error">
      <div className="flex flex-col gap-8 pb-12">
        <p className="text-3xl text-rose-500">Error: Server Not Reachable 😟</p>
        <p className="text-3xl text-slate-500">
          This part of ACT Labs require server to be running. But, it seems the
          server is not running.
        </p>
        <p className="text-3xl text-slate-500">
          <a
            href="https://actlabsdocs.z13.web.core.windows.net/docs/introduction"
            target={"_blank"}
            className="text-sky-500 underline"
          >
            Learn more
          </a>{" "}
          about deploying configuring the server in ACT Labs Docs or deploy
          using either of the following options.
        </p>
      </div>
      <div className={`flex flex-col gap-10`}>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl">Run on Docker</h3>
          <StartCommand />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl">Deploy as WebApp</h3>
          <DeployWebAppCommand />
        </div>
      </div>
    </PageLayout>
  );
}

import DeployWebAppCommand from "../../components/DeployWebAppCommand";
import StartCommand from "../../components/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function ServerError() {
  return (
    <PageLayout heading="Server Error">
      <div className="flex flex-col items-center gap-4">
        <p className="text-3xl text-slate-500">
          This part of ACT Labs require server to be running. But, it seems the
          server is not running ☹️.
        </p>

        <div className="flex w-full flex-col items-center gap-10">
          <div className="pt-32 text-2xl">
            <a
              href="https://actlabsdocs.z13.web.core.windows.net/docs/getting-started"
              target={"_blank"}
              className="rounded bg-purple-500 py-2 px-8 text-slate-100 outline outline-purple-500 hover:bg-purple-600 hover:outline-purple-600"
            >
              Get Started
            </a>
          </div>
          <div className="flex w-full flex-col gap-2">
            <h3 className="text-xl">Run on Docker</h3>
            <StartCommand />
          </div>
          <div className="flex w-full flex-col gap-2">
            <h3 className="text-xl">Deploy as WebApp</h3>
            <DeployWebAppCommand />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

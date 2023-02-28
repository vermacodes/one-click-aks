import StartCommand from "../../components/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function ServerError() {
  return (
    <PageLayout heading="Server Error">
      <div className="flex flex-col gap-4">
        <p className="text-3xl text-slate-500">
          It seems the server is not running ☹️. You need to install docker and
          run server using command below 👇. If you are new here, use 'Get
          Started' button to setup.
        </p>

        <div className="flex gap-10">
          <StartCommand />
        </div>
      </div>
    </PageLayout>
  );
}

import { useServerStatus } from "../../../hooks/useServerStatus";

export default function ServerNotConnected() {
  const { data: serverStatus, isFetching } = useServerStatus();

  if (serverStatus && serverStatus.status === "OK") {
    return <></>;
  }

  return (
    <div className="my-4">
      <div className="mt-2 rounded border border-red-500 bg-red-500 bg-opacity-20 p-2">
        <strong>🛑 Server Not Connected:</strong> ACT Labs requires{" "}
        <a className="underline">user to host their own server</a>.{" "}
        <a
          href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849282/Getting-Started"
          target="_blank"
          className="cursor-pointer text-sky-600 underline"
        >
          Follow these instructions to host your own server
        </a>{" "}
        and check your{" "}
        <a href="/settings" className="cursor-pointer text-sky-600 underline">
          Settings
        </a>{" "}
        to make sure the <strong>Server Endpoint</strong> is correct.{" "}
      </div>
    </div>
  );
}

import { useServerStatus } from "../../../hooks/useServerStatus";

export default function ServerNotConnected() {
  const { data: serverStatus, isFetching } = useServerStatus();

  if (serverStatus && serverStatus.status === "OK") {
    return <></>;
  }

  return (
    <div className="my-4">
      <div className="mt-2 rounded border border-red-500 bg-red-500 bg-opacity-20 p-2">
        <strong>🛑 Server Not Connected:</strong> ACT Labs needs the server to
        work properly. Please check your{" "}
        <a href="/settings" className="cursor-pointer text-sky-600 underline">
          Settings
        </a>{" "}
        to make sure the server is running and the Endpoint is correct.{" "}
        <a
          href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849282/Getting-Started"
          target="_blank"
          className="cursor-pointer text-sky-600 underline"
        >
          Read More
        </a>{" "}
        about how to setup the server.
      </div>
    </div>
  );
}

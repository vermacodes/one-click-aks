import { useServerStatus } from "../../../hooks/useServerStatus";

export default function VersionCheck() {
  const { data, isFetching } = useServerStatus();

  //check if version in status is greater than a given number. if so, return true else return false
  function versionCheck(version: string) {
    //if version is undefined, return false
    if (version === undefined || version === "") {
      return false;
    }

    const versionNumber = parseInt(version);
    return versionNumber >= 20231107;
  }

  if (data === undefined || isFetching || versionCheck(data.version)) {
    return <></>;
  }

  return (
    <div className="my-4">
      <div className="mt-2 rounded border border-red-500 bg-red-500 bg-opacity-20 p-2">
        <strong>New Version Released:</strong> The versions of your server and
        client do not match. This requires a server re-deployment.
        <br />
        <a
          href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849282/Getting-Started"
          className="cursor-pointer text-sky-500 underline"
          target="_blank"
        >
          Follow these instructions to re-deploy your server.
        </a>
      </div>
    </div>
  );
}

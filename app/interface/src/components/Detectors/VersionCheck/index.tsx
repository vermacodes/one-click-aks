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
    return versionNumber >= 20231208;
  }

  if (data === undefined || isFetching) {
    return <></>;
  }

  if (data.status !== "OK") {
    return <></>;
  }

  if (versionCheck(data.version)) {
    return <></>;
  }

  return (
    <div className="my-4">
      <div className="mt-2 rounded border border-red-500 bg-red-500 bg-opacity-20 p-2">
        <strong>New Version Released:</strong> The UI has been updated and needs
        newer version of server. Running old version of server may result in
        unexpected behavior.
        <br />
        <a
          href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849282/Getting-Started"
          className="cursor-pointer text-sky-500 underline"
          target="_blank"
        >
          Please follow these instructions to re-deploy your server.
        </a>
      </div>
    </div>
  );
}

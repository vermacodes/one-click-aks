import { useGetMyDeployments } from "../../../hooks/useDeployments";
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
    return versionNumber >= 20231018;
  }

  if (data === undefined || isFetching || versionCheck(data.version)) {
    return <></>;
  }

  return (
    <div className="my-4">
      <div className="mt-2 rounded border border-red-500 bg-red-500 bg-opacity-20 p-2">
        <strong>Oh no!</strong> There is a version mismatch between server and
        client. That means its time to upgrade your server.{" "}
        <a
          href="https://actlabsdocs.z13.web.core.windows.net/docs/getting-started"
          className="cursor-pointer hover:text-sky-500 hover:underline"
          target="_blank"
        >
          Click here for instructions.
        </a>
      </div>
    </div>
  );
}

import { useGetMyDeployments } from "../../../hooks/useDeployments";

export default function VersionCheck() {
  const { data: deployments, isError } = useGetMyDeployments();
  return (
    <div className="my-4">
      {isError ||
        (!deployments && (
          <div className="mt-2 rounded border border-red-500 bg-red-500 bg-opacity-20 p-2">
            <strong>Oh no!</strong> There is a version mismatch between server
            and client. That means its time to upgrade your server.{" "}
            <a
              href="https://actlabsdocs.z13.web.core.windows.net/docs/getting-started"
              className="cursor-pointer hover:text-sky-500 hover:underline"
              target="_blank"
            >
              Click here for instructions.
            </a>
          </div>
        ))}
    </div>
  );
}

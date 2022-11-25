import Terminal from "../../components/Terminal";
import { BlobType } from "../../dataStructures";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useSharedLabs } from "../../hooks/useBlobs";
import { useSetLogs } from "../../hooks/useLogs";
import { axiosInstance } from "../../utils/axios-interceptors";
import ServerError from "../ServerError";

export default function Labs() {
  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { data: blobs, isLoading, isError } = useSharedLabs();

  function deployHandler(blob: BlobType) {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("deploylab", blob);
  }

  //This function is called after deployHandler streaming ends.
  function breakHandler(blob: BlobType) {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("breaklab", blob);
  }

  function validateHandler(blob: BlobType) {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("validatelab", blob);
  }

  function destroyHandler(blob: BlobType) {
    setActionStatus({ inProgress: true });
    setLogs({ isStreaming: true, logs: "" });
    axiosInstance.post("destroy", blob);
  }

  if (isLoading) {
    return <div className="my-3 mx-20 mb-2">Loading...</div>;
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <div className="my-3 mx-20 mb-2">
      {blobs && (
        <table className="table-flex mb-4 w-full border-collapse border border-slate-500">
          <thead>
            <tr>
              <th className="border-collapse border border-slate-500 py-1 px-4">
                Template Name
              </th>
              <th className="border-collapse border border-slate-500 py-1 px-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {blobs.map((blob: any) => (
              <tr key={blob.name}>
                <td className="border-collapse border border-slate-500 py-1 px-4 ">
                  {blob.name}
                </td>
                <td className="border-collapse space-x-2 border border-slate-500 py-1 px-4 text-center">
                  <button
                    className="text-bold rounded-2xl bg-slate-500 py-1 px-5 text-white hover:bg-slate-700 disabled:bg-slate-300"
                    onClick={() => deployHandler(blob)}
                    disabled={inProgress}
                  >
                    Deploy
                  </button>{" "}
                  <button
                    className="text-bold rounded-2xl bg-green-500 py-1 px-5 text-white hover:bg-green-700 disabled:bg-slate-300"
                    onClick={() => breakHandler(blob)}
                    disabled={inProgress}
                  >
                    Break
                  </button>{" "}
                  <button
                    className="text-bold rounded-2xl bg-sky-500 py-1 px-5 text-white hover:bg-sky-700 disabled:bg-slate-300"
                    onClick={() => validateHandler(blob)}
                    disabled={inProgress}
                  >
                    Validate
                  </button>{" "}
                  <button
                    className="text-bold rounded-2xl bg-red-500 py-1 px-5 text-white hover:bg-red-700 disabled:bg-slate-300"
                    onClick={() => destroyHandler(blob)}
                    disabled={inProgress}
                  >
                    Destroy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Terminal />
    </div>
  );
}

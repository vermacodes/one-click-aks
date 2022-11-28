import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Terminal from "../../components/Terminal";
import {
  useActionStatus,
  useSetActionStatus,
} from "../../hooks/useActionStatus";
import { useSharedTemplates } from "../../hooks/useBlobs";
import { useSetLogs } from "../../hooks/useLogs";
import { axiosInstance } from "../../utils/axios-interceptors";
import ServerError from "../ServerError";

export default function Templates() {
  const { data: inProgress } = useActionStatus();
  const { mutate: setActionStatus } = useSetActionStatus();
  const { mutate: setLogs } = useSetLogs();
  const { data: blobs, isLoading, isError } = useSharedTemplates();
  const navigate = useNavigate();

  function actionHandler(url: string, action: string) {
    axios.get(url).then((response) => {
      setActionStatus({ inProgress: true });
      setLogs({ isStreaming: true, logs: "" });
      axiosInstance.post(`${action}`, response.data);
    });
  }

  function viewHandler(url: string) {
    navigate("/builder");
    axios.get(url).then((response) => {
      console.log(response.data);
      setLogs({
        isStreaming: false,
        logs: JSON.stringify(response.data, null, 4),
      });
    });
  }

  if (isLoading) {
    return <div className="my-3 mx-20 mb-2">Loading...</div>;
  }

  if (isError) {
    return <ServerError />;
  }

  return (
    <div className="my-3 mx-20 mb-2">
      {blobs !== undefined && (
        <table className="table-flex mb-4 w-full rounded border border-slate-500">
          <thead>
            <tr>
              <th className="border border-slate-500 py-1 px-4">
                Template Name
              </th>
              <th className="border border-slate-500 py-1 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blobs.map((blob: any) => (
              <tr key={blob.name}>
                <td className="border border-slate-500 py-1 px-4 ">
                  {blob.name}
                </td>
                <td className="space-x-2 border border-slate-500 py-1 px-4 text-center">
                  <Button
                    variant="secondary-outline"
                    onClick={() => viewHandler(blob.url)}
                    disabled={inProgress}
                  >
                    View
                  </Button>
                  <Button
                    variant="success-outline"
                    onClick={() => actionHandler(blob.url, "plan")}
                    disabled={inProgress}
                  >
                    Plan
                  </Button>
                  <Button
                    variant="primary-outline"
                    onClick={() => actionHandler(blob.url, "apply")}
                    disabled={inProgress}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="danger-outline"
                    onClick={() => actionHandler(blob.url, "destroy")}
                    disabled={inProgress}
                  >
                    Destroy
                  </Button>
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

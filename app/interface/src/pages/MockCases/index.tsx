import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { TfvarConfigType } from "../../dataStructures";
import { useActionStatus } from "../../hooks/useActionStatus";
import { useSharedTemplates } from "../../hooks/useBlobs";
import { useSetLogs } from "../../hooks/useLogs";
import { useSetTfvar } from "../../hooks/useTfvar";

export default function MockCases() {
  const { data: blobs, isLoading, isError } = useSharedTemplates();

  const { mutate: setTfvar } = useSetTfvar();
  const { data: inProgress } = useActionStatus();
  const { mutate: setLogs } = useSetLogs();

  const navigate = useNavigate();

  var tfvar: TfvarConfigType;

  function hanldeOnClick(url: string) {
    if (!inProgress) {
      axios
        .get(url, {
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        .then((response: AxiosResponse<TfvarConfigType>) => {
          console.log(response.data);
          setLogs({
            isStreaming: false,
            logs: JSON.stringify(response.data, null, 4),
          });
          tfvar = { ...response.data, firewalls: [...response.data.firewalls] };
          console.log(tfvar);
          console.log(url);
          setTfvar(response.data);
          navigate("/builder");
        });
    }
  }

  if (isLoading) {
    return (
      <div className="my-3 mx-20 mb-2 flex space-x-4">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="my-3 mx-20 mb-2 flex space-x-4">
      <div className="grid w-screen grid-cols-4 gap-4">
        {blobs !== undefined &&
          blobs.map((blob: any) => (
            <div
              key={blob.name}
              className="h-44 rounded bg-slate-200 p-4 shadow shadow-slate-300 hover:border hover:border-slate-500 hover:shadow-lg dark:bg-slate-800 dark:shadow-slate-700"
              onClick={() => hanldeOnClick(blob.url)}
            >
              <p className="break-all">{blob.name}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

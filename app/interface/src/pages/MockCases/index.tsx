import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import TemplateCard from "../../components/TemplateCard";
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
      <div className="my-3 mx-20 mb-2 flex gap-x-4">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="my-3 mx-20 mb-2 flex gap-x-4">
      <div className="grid w-screen grid-cols-3 gap-4">
        {blobs !== undefined &&
          blobs.map((blob: any) => (
            <TemplateCard key={blob.name}>
              <div className="flex h-full flex-col justify-between gap-y-4">
                <p className="break-all">{blob.name}</p>

                <div className="flex justify-end gap-x-4">
                  <Button
                    variant="primary"
                    onClick={() => hanldeOnClick(blob.url)}
                  >
                    Load to Builder
                  </Button>
                </div>
              </div>
            </TemplateCard>
          ))}
      </div>
    </div>
  );
}

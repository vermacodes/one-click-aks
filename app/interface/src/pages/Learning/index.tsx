import Button from "../../components/Button";
import TemplateCard from "../../components/TemplateCard";
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

export default function Learning() {
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
      <div className="mb-2">
        {blobs &&
          blobs.map((blob: any) => (
            <TemplateCard key={blob.name}>
              <div className="flex h-full flex-col justify-between gap-y-4">
                <p className="break-all">{blob.name}</p>

                <div className="flex justify-end gap-x-4">
                  <Button
                    variant="primary"
                    onClick={() => deployHandler(blob)}
                    disabled={inProgress}
                  >
                    Deploy
                  </Button>{" "}
                  <Button
                    variant="secondary"
                    onClick={() => breakHandler(blob)}
                    disabled={inProgress}
                  >
                    Break
                  </Button>{" "}
                  <Button
                    variant="success"
                    onClick={() => validateHandler(blob)}
                    disabled={inProgress}
                  >
                    Validate
                  </Button>{" "}
                  <Button
                    variant="danger"
                    onClick={() => destroyHandler(blob)}
                    disabled={inProgress}
                  >
                    Destroy
                  </Button>
                </div>
              </div>
            </TemplateCard>
          ))}
      </div>
      <Terminal />
    </div>
  );
}

import { useState } from "react";
import Button from "../Button";
import Checkbox from "../Checkbox";
import CurrentTerraformWorkspace from "../CurrentTerraformWorkspace";
import { useTerraformWorkspace } from "../../hooks/useWorkspace";
import { SiTerraform } from "react-icons/si";

export default function Deployment() {
  const [autoDelete, setAutoDelete] = useState(false);
  const { data } = useTerraformWorkspace();

  function handleAutoDeleteChange() {
    setAutoDelete(!autoDelete);
  }

  return (
    <div
      className={`mb-3 rounded bg-slate-50 p-3 outline-1 outline-sky-500 hover:outline dark:bg-slate-900`}
    >
      <div className="flex justify-between">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
          {/* <h1 className="text-xl">
            <SiTerraform />
          </h1>
          <h1 className="text-xl">Workspace →</h1>
          <h1 className="text-xl text-sky-500">
            {data &&
              data.map((workspace) => (
                <div key={workspace.name}>
                  {workspace.selected && workspace.name}
                </div>
              ))}
          </h1> */}
          <CurrentTerraformWorkspace />
        </div>
        <div className="flex flex-wrap gap-y-2 gap-x-2">
          <Checkbox
            id="auto-delete"
            label="Auto Delete"
            checked={autoDelete}
            handleOnChange={handleAutoDeleteChange}
            disabled={false}
          />
          <div
            className={`flex w-32 items-center justify-between rounded border border-slate-500 px-2 py-1`}
          >
            8 Hours
          </div>
          <Button variant="primary-text">Add</Button>
          <Button variant="secondary-text">View</Button>
          <Button variant="danger-text">Delete</Button>
        </div>
      </div>
    </div>
  );
}

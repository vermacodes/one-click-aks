import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useSetLogs } from "../../hooks/useLogs";
import { usePreference, useSetPreference } from "../../hooks/usePreference";
import { useTfvar } from "../../hooks/useTfvar";
type Props = { regionEdit: boolean; setRegionEdit(args: boolean): void };

export default function AzureRegion({ regionEdit, setRegionEdit }: Props) {
  const [azureRegion, setAzureRegion] = useState<string>("");

  const { data: preference, isLoading } = usePreference();
  const { mutate: setPreferece } = useSetPreference();
  const { data: tfvar } = useTfvar();
  const { mutate: setLogs } = useSetLogs();

  function handleAzureRegion(event: React.ChangeEvent<HTMLInputElement>) {
    setAzureRegion(event.target.value);
  }

  function handleOnClick() {
    setPreferece({
      ...preference,
      azureRegion: azureRegion,
    });
    if (tfvar) {
      tfvar.resourceGroup.location = azureRegion;
    }
    setLogs({ isStreaming: false, logs: JSON.stringify(tfvar, null, 4) });
  }

  return (
    <div className="w-100 gap-x-reverse flex items-center justify-between gap-x-2 py-2">
      <h2 className="text-lg">Azure Region</h2>
      <div
        className={`${
          regionEdit && "hidden"
        } flex w-96 items-center justify-between rounded border border-slate-500 p-2`}
        onDoubleClick={(e) => {
          setRegionEdit(true);
          preference && setAzureRegion(preference?.azureRegion);
        }}
      >
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p>{preference ? preference.azureRegion : "Add a region."}</p>
            <p className="text-xs">Doubble click to edit.</p>
          </>
        )}
      </div>
      <div
        className={`${
          !regionEdit && "hidden"
        } flex w-96 items-center justify-between gap-x-2 rounded border border-slate-500`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          className="block h-10 w-full bg-inherit px-2 text-inherit"
          placeholder="Azure Region"
          value={azureRegion}
          onChange={handleAzureRegion}
        />
        {/* <button
          className="p-2 text-2xl hover:text-red-500"
          onClick={() => setRegionEdit(false)}
        >
          <FaTimes />
        </button> */}
        <button
          className="p-2 text-2xl hover:text-sky-500"
          onClick={() => handleOnClick()}
        >
          <FaCheck />
        </button>
      </div>
    </div>
  );
}

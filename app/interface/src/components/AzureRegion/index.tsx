import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useLab } from "../../hooks/useLab";
import { useSetLogs } from "../../hooks/useLogs";
import { usePreference, useSetPreference } from "../../hooks/usePreference";
import { useGetStorageAccount } from "../../hooks/useStorageAccount";
import SettingsItemLayout from "../../layouts/SettingsItemLayout";
type Props = { regionEdit: boolean; setRegionEdit(args: boolean): void };

export default function AzureRegion({ regionEdit, setRegionEdit }: Props) {
  const [azureRegion, setAzureRegion] = useState<string>("");

  const {
    data: preference,
    isLoading: loadingPreference,
    isFetching: fetchingPreference,
  } = usePreference();

  const { mutate: setPreferece, isLoading: settingPreference } =
    useSetPreference();
  const { data: lab } = useLab();
  const { mutate: setLogs } = useSetLogs();

  const {
    data: storageAccount,
    isLoading: getStorageAccountLoading,
    isFetching: fetchingStorageAccount,
    isError: getStorageAccountError,
  } = useGetStorageAccount();

  function handleAzureRegion(event: React.ChangeEvent<HTMLInputElement>) {
    setAzureRegion(event.target.value);
  }

  function handleOnSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleOnClick();
  }

  function handleOnClick() {
    setRegionEdit(false);
    if (preference !== undefined) {
      setPreferece({
        ...preference,
        azureRegion: azureRegion,
      });
      if (lab && lab.template) {
        lab.template.resourceGroup.location = azureRegion;
      }
      setLogs({
        isStreaming: false,
        logs: JSON.stringify(lab?.template, null, 4),
      });
    }
  }

  return (
    <SettingsItemLayout>
      <div
        className={`w-100 gap-x-reverse flex items-center justify-between gap-x-2 py-2 ${
          (fetchingStorageAccount ||
            storageAccount === undefined ||
            storageAccount.storageAccount.name === "") &&
          " text-slate-400"
        }`}
      >
        <h2 className="text-lg">Azure Region</h2>
        <div
          className={`${
            regionEdit && "hidden"
          } flex w-96 items-center justify-between rounded border border-slate-500 p-2`}
          onDoubleClick={(e) => {
            !(
              fetchingStorageAccount ||
              storageAccount === undefined ||
              storageAccount.storageAccount.name === ""
            ) && setRegionEdit(true);
            preference && setAzureRegion(preference?.azureRegion);
          }}
        >
          {loadingPreference || fetchingPreference || settingPreference ? (
            <p>Please wait...</p>
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
          <form
            className="block h-10 w-full bg-inherit px-2 text-inherit"
            onSubmit={(e) => handleOnSubmit(e)}
          >
            <input
              type="text"
              className="h-10 w-full bg-inherit text-inherit outline-none"
              placeholder="Azure Region"
              value={azureRegion}
              disabled={
                fetchingStorageAccount ||
                storageAccount === undefined ||
                storageAccount.storageAccount.name === ""
              }
              onChange={handleAzureRegion}
            />
          </form>
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
    </SettingsItemLayout>
  );
}

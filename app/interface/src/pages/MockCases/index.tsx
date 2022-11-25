import { useState } from "react";
import { MdBluetoothSearching } from "react-icons/md";
import { useSharedTemplates } from "../../hooks/useBlobs";

export default function MockCases() {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const { data: blobs, isLoading, isError } = useSharedTemplates();

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
              className="h-48 p-4 shadow shadow-slate-300 dark:shadow-slate-700 "
            >
              <p className="break-all">{blob.name}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

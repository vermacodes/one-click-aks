import { Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import { FaCheck } from "react-icons/fa";
import ConfirmationModal from "../../../UserInterfaceComponents/Modal/ConfirmationModal";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCreateLab } from "../../../../hooks/useBlobs";
import { useQueryClient } from "react-query";

type Props = {
  parentLab: Lab;
  labs: Lab[];
  selectedLab: Lab;
  setSelectedLab: (lab: Lab) => void;
  versionA: Lab;
  versionB: Lab;
  setVersionA: (lab: Lab) => void;
  setVersionB: (lab: Lab) => void;
};

export default function LabVersionsTable({
  parentLab,
  labs,
  selectedLab,
  setSelectedLab,
  versionA,
  versionB,
  setVersionA,
  setVersionB,
}: Props) {
  const [secure, setSecure] = useState<string | undefined>(undefined);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const { mutateAsync: createLab } = useCreateLab();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (parentLab) {
      if (parentLab.type === "sharedtemplate") {
        setSecure("public");
      } else {
        setSecure("protected");
      }
    }
  }, [parentLab]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  function handleCompareSelection(lab: Lab) {
    setVersionA(versionB);
    setVersionB(lab);
  }

  function onConfirmCreateLab(lab: Lab) {
    setShowConfirmationModal(false);
    const response = toast.promise(createLab(lab), {
      pending: "Saving lab...",
      success: "Lab saved.",
      error: {
        render(data: any) {
          return `Lab creation failed: ${data.data.data}`;
        },
        autoClose: false,
      },
    });

    response.then(() => {
      queryClient.invalidateQueries("labs");
      queryClient.invalidateQueries("sharedLabs");
      queryClient.invalidateQueries("publicLabs");
      queryClient.invalidateQueries(
        `versions-${parentLab.type}-${parentLab.id}-${secure}`
      );
    });
  }

  return (
    <table className="h-fit w-full max-w-full table-auto border-separate justify-between gap-y-6 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500">
      <thead>
        <tr>
          <th className="py-2 px-4">Compare</th>
          <th className="py-2 px-4"></th>
          <th className="py-2 px-4">Updated On</th>
          <th className="py-2 px-4">Updated By</th>
          <th className="py-2 px-4"></th>
        </tr>
      </thead>
      <tbody>
        {labs
          ?.sort(
            (a, b) =>
              new Date(b.versionId).getTime() - new Date(a.versionId).getTime()
          )
          .map((lab, index) => (
            <tr
              key={lab.versionId}
              className={`${
                lab.isCurrentVersion &&
                "bg-green-500 bg-opacity-20 font-bold hover:bg-green-500 hover:bg-opacity-30 "
              }
                  ${
                    selectedLab.versionId === lab.versionId &&
                    "cursor-auto bg-sky-500 bg-opacity-20 font-bold hover:bg-sky-500 hover:bg-opacity-30 "
                  }
                      cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800
                  `}
              onClick={() => setSelectedLab(lab)}
            >
              <td className="py-2 px-4">
                <Checkbox
                  label={
                    versionA.versionId === lab.versionId
                      ? "A"
                      : versionB.versionId === lab.versionId
                      ? "B"
                      : ""
                  }
                  id={lab.versionId}
                  handleOnChange={() => handleCompareSelection(lab)}
                  checked={
                    versionA.versionId === lab.versionId ||
                    versionB.versionId === lab.versionId
                  }
                />
              </td>
              <td className="py-2 px-4">{index + 1}</td>
              <td className="py-2 px-4">{formatDate(lab.versionId)}</td>
              <td className="py-2 px-4">
                {lab.updatedBy !== "" ? lab.updatedBy : lab.createdBy}
              </td>
              <td>
                {!lab.isCurrentVersion && (
                  <Button
                    variant="text"
                    onClick={() => setShowConfirmationModal(true)}
                  >
                    <FaCheck /> Set Current
                  </Button>
                )}
              </td>
              {showConfirmationModal && (
                <ConfirmationModal
                  title="Confirm Update"
                  onClose={() => setShowConfirmationModal(false)}
                  onConfirm={() => onConfirmCreateLab(lab)}
                >
                  <p className="text-xl">
                    Are you sure you want to update this lab? This will
                    irreversibly overwrite existing lab for all users.
                  </p>
                </ConfirmationModal>
              )}
            </tr>
          ))}
      </tbody>
    </table>
  );
}

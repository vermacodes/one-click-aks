import { Change, diffLines } from "diff";
import { html as beautifyHtml } from "js-beautify";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { ButtonVariant, Lab } from "../../../dataStructures";
import { useCreateLab, useGetVersionsById } from "../../../hooks/useBlobs";
import Button from "../../UserInterfaceComponents/Button";
import Checkbox from "../../UserInterfaceComponents/Checkbox";
import ConfirmationModal from "../../UserInterfaceComponents/Modal/ConfirmationModal";
import ModalBackdrop from "../../UserInterfaceComponents/Modal/ModalBackdrop";
import LabCard from "../LabCard";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

type Props = {
  variant?: ButtonVariant;
  lab: Lab;
  children: React.ReactNode;
};

export default function LabVersions({
  variant = "secondary-text",
  lab: parentLab,
  children,
}: Props) {
  const [id, setId] = useState<string | undefined>(undefined);
  const [typeOfLab, setTypeOfLab] = useState<string | undefined>(undefined);
  const [categoryOfLab, setCategoryOfLab] = useState<string | undefined>(
    undefined
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const { mutateAsync: createLab } = useCreateLab();
  const queryClient = useQueryClient();

  const { data: labs } = useGetVersionsById(id, typeOfLab, categoryOfLab);

  useEffect(() => {
    if (parentLab) {
      setId(parentLab.id);
      setTypeOfLab(parentLab.type);
      setCategoryOfLab(parentLab.category);
    }
  }, [parentLab]);

  function onConfirmCreateLab(lab: Lab) {
    setShowConfirmationModal(false);
    const response = toast.promise(createLab(lab), {
      pending: "Saving lab...",
      success: "Lab saved.",
      error: {
        render(data: any) {
          return `Lab creation failed: ${data.data.response.data.error}`;
        },
        autoClose: false,
      },
    });

    response.then(() => {
      queryClient.invalidateQueries("labs");
      queryClient.invalidateQueries("sharedLabs");
      queryClient.invalidateQueries("publicLabs");
      queryClient.invalidateQueries(
        `versions-${parentLab.type}-${parentLab.id}-${categoryOfLab}`
      );
    });
  }

  return (
    <>
      <Button
        variant={variant}
        disabled={!labs}
        onClick={() => setShowModal(true)}
      >
        {children}
      </Button>
      {showModal && (
        <Modal
          parentLab={parentLab}
          labs={labs}
          setShowModal={setShowModal}
          onConfirmCreateLab={onConfirmCreateLab}
          showConfirmationModal={showConfirmationModal}
          setShowConfirmationModal={setShowConfirmationModal}
        />
      )}
    </>
  );
}

type ModalProps = {
  parentLab: Lab;
  labs: Lab[] | undefined;
  setShowModal: (args: boolean) => void;
  onConfirmCreateLab(lab: Lab): void;
  showConfirmationModal: boolean;
  setShowConfirmationModal(args: boolean): void;
};

function Modal({
  parentLab,
  labs,
  setShowModal,
  onConfirmCreateLab,
  showConfirmationModal,
  setShowConfirmationModal,
}: ModalProps) {
  const [selectedLab, setSelectedLab] = useState<Lab>(parentLab);
  const [versionA, setVersionA] = useState<Lab>(parentLab);
  const [versionB, setVersionB] = useState<Lab>(parentLab);

  useEffect(() => {
    labs?.forEach((lab) => {
      if (lab.isCurrentVersion) {
        setSelectedLab(lab);
      }
    });
  }, []);

  function handleCompareSelection(lab: Lab) {
    // if (lab.versionId === versionB.versionId) {
    //   return;
    // }
    setVersionA(versionB);
    setVersionB(lab);
  }

  return (
    <ModalBackdrop
      onClick={(e) => {
        setShowModal(false);
        e.stopPropagation();
      }}
    >
      <div
        className="my-10 h-[90%] w-2/3 space-y-4 overflow-y-auto rounded bg-slate-100 p-5 overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:divide-slate-700 dark:bg-slate-800 dark:scrollbar-thumb-slate-600"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-100 flex justify-between border-b-2 border-slate-500 pb-2">
          <h1 className="text-3xl">Version History - {parentLab.name}</h1>
          <button
            onClick={() => setShowModal(false)}
            className="hover:text-sky-500"
          >
            <MdClose className="text-3xl" />
          </button>
        </div>
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
                  new Date(b.versionId).getTime() -
                  new Date(a.versionId).getTime()
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
                        Are you sure? This will create a new version for all
                        users to see.
                      </p>
                    </ConfirmationModal>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
        <LabCard lab={selectedLab} fullPage={true} />
        {versionA.versionId === versionB.versionId ? null : (
          <>
            <VersionDiff
              versionA={JSON.stringify(versionA.template, null, 4)}
              versionB={JSON.stringify(versionB.template, null, 4)}
              heading="Template"
            />
            <VersionDiff
              versionA={atob(versionA.extendScript)}
              versionB={atob(versionB.extendScript)}
              heading="Extend Script"
            />
            <VersionDiff
              versionA={beautifyHtml(atob(versionA.description))}
              versionB={beautifyHtml(atob(versionB.description))}
              heading="Description"
            />
          </>
        )}
      </div>
    </ModalBackdrop>
  );
}

type VersionDiffProps = {
  versionA: string;
  versionB: string;
  heading: string;
};

function VersionDiff({ versionA, versionB, heading }: VersionDiffProps) {
  const [differences, setDifferences] = useState<Change[]>([]);

  useEffect(() => {
    setDifferences(diffLines(versionA, versionB));
  }, [versionA, versionB]);

  return (
    <div className="flex h-fit max-w-full flex-col justify-between gap-y-6 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500">
      <h2 className="text-2xl">{heading}</h2>
      <div className="w-full">
        {differences.map((part, index) => (
          <pre
            key={index}
            className={`${
              part.added
                ? "bg-green-500 bg-opacity-20 dark:bg-green-500 dark:bg-opacity-20"
                : part.removed &&
                  "bg-rose-500 bg-opacity-20 dark:bg-rose-500 dark:bg-opacity-20"
            }`}
          >
            {part.value}
          </pre>
        ))}
      </div>
    </div>
  );
}

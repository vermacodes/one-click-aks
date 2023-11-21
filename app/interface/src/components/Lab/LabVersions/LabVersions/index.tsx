import { useEffect, useState } from "react";
import { diffLines, Change } from "diff";
import { html as beautifyHtml } from "js-beautify";
import { ButtonVariant, Lab } from "../../../../dataStructures";
import { useCreateLab, useGetVersionsById } from "../../../../hooks/useBlobs";
import ModalBackdrop from "../../../UserInterfaceComponents/Modal/ModalBackdrop";
import Button from "../../../UserInterfaceComponents/Button";
import { MdClose } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../UserInterfaceComponents/Modal/ConfirmationModal";
import { useQueryClient } from "react-query";
import LabCard from "../../LabCard";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";
import LabVersionsTable from "../LabVersionsTable";
import LabVersionDiff from "../LabVersionDiff";
import { set } from "zod";

type Props = {
  labs: Lab[];
};

export default function LabVersions({ labs }: Props) {
  const [currentVersion, setCurrentVersion] = useState<Lab | undefined>(
    undefined
  );
  const [selectedLab, setSelectedLab] = useState<Lab | undefined>(undefined);
  const [versionA, setVersionA] = useState<Lab | undefined>(undefined);
  const [versionB, setVersionB] = useState<Lab | undefined>(undefined);

  useEffect(() => {
    if (labs) {
      const currentVersion = labs.find((lab) => lab.isCurrentVersion === true);
      setCurrentVersion(currentVersion);
      setVersionA(currentVersion);
      setVersionB(currentVersion);
    }
  }, [labs]);

  if (!labs || labs.length === 0 || currentVersion === undefined) {
    return <p>Not able find current version.</p>;
  }

  return currentVersion === undefined ? null : (
    <div className="flex flex-col gap-4">
      <LabVersionsTable
        labs={labs}
        parentLab={currentVersion}
        selectedLab={selectedLab || currentVersion}
        setSelectedLab={setSelectedLab}
        versionA={versionA ? versionA : currentVersion}
        versionB={versionB ? versionB : currentVersion}
        setVersionA={setVersionA}
        setVersionB={setVersionB}
      />
      {selectedLab && <LabCard lab={selectedLab} fullPage={true} />}
      <LabVersionDiff versionA={versionA} versionB={versionB} />
    </div>
  );
}

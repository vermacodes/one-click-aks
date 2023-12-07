import { useEffect, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Lab } from "../../../../dataStructures";
import { useGetVersionsById } from "../../../../hooks/useBlobs";
import Button from "../../../UserInterfaceComponents/Button";
import LabCard from "../../LabCard";
import LabVersionDiff from "../LabVersionDiff";
import LabVersionsTable from "../LabVersionsTable";

type Props = {
  lab: Lab;
};

export default function LabVersions({ lab }: Props) {
  const [selectedLab, setSelectedLab] = useState<Lab | undefined>(undefined);
  const [versionA, setVersionA] = useState<Lab | undefined>(undefined);
  const [versionB, setVersionB] = useState<Lab | undefined>(undefined);
  const {
    data: labs,
    isLoading,
    isFetching,
  } = useGetVersionsById(lab.id, lab.type, lab.category);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedLab(lab);
    setVersionA(lab);
    setVersionB(lab);
  }, [lab]);

  if (!selectedLab || !versionA || !versionB) {
    return null;
  }

  if (isLoading || isFetching) {
    return <p className="text-3xl">Loading...</p>;
  }

  if (!labs || labs.length === 0) {
    return <p className="text-3xl">No versions found.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center text-lg">
        <Button variant="text" onClick={() => navigate(-1)}>
          <MdArrowBack /> Back
        </Button>
      </div>
      <LabVersionsTable
        labs={labs}
        parentLab={lab}
        selectedLab={selectedLab}
        setSelectedLab={setSelectedLab}
        versionA={versionA}
        versionB={versionB}
        setVersionA={setVersionA}
        setVersionB={setVersionB}
      />
      <div
        className={`${
          versionA?.versionId !== versionB.versionId
            ? "grid-cols-2 "
            : "grid-cols-1 "
        } grid gap-4`}
      >
        <LabCard lab={versionA} fullPage={true} />
        {versionA?.versionId !== versionB.versionId && (
          <LabCard lab={versionB} fullPage={true} />
        )}
      </div>
      <LabVersionDiff versionA={versionA} versionB={versionB} />
    </div>
  );
}

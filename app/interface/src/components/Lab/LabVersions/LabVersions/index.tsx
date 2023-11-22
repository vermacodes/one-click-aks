import { useEffect, useState } from "react";
import { Lab } from "../../../../dataStructures";
import LabCard from "../../LabCard";
import LabVersionsTable from "../LabVersionsTable";
import LabVersionDiff from "../LabVersionDiff";
import { useGetVersionsById } from "../../../../hooks/useBlobs";

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
  } = useGetVersionsById(
    lab.id,
    lab.type,
    lab.type === "sharedtemplate" ? "public" : "protected"
  );

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

import React, { useEffect, useState } from "react";
import { FaShare } from "react-icons/fa";
import { useParams } from "react-router-dom";
import Button from "../../components/Button";
import ExportLabButton from "../../components/Lab/Export/ExportLabButton";
import LabCard from "../../components/Lab/LabCard";
import LoadToBuilderButton from "../../components/Lab/LoadToBuilderButton";
import TemplateCard from "../../components/TemplateCard";
import { Lab } from "../../dataStructures";
import { useSharedTemplates } from "../../hooks/useBlobs";
import { useLab } from "../../hooks/useLab";
import PageLayout from "../../layouts/PageLayout";

type Props = {};

export default function LabPage({}: Props) {
  const { type, id } = useParams();
  const [lab, setLab] = useState<Lab | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const {
    data: sharedLabs,
    isLoading: sharedLabsLoading,
    isFetching: sharedLabsFetching,
  } = useSharedTemplates();

  useEffect(() => {
    if (type === "sharedtemplate" && sharedLabs) {
      sharedLabs.forEach((lab) => {
        if (lab.id === id) {
          setLab(lab);
        }
      });
    }
  }, [sharedLabs]);

  function copyLinkToLab(lab: Lab) {
    navigator.clipboard.writeText(
      `${window.location.origin}/lab/sharedtemplate/${lab.id}`
    );

    // Set copied to true for 2 seconds
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  if (sharedLabsLoading || sharedLabsFetching) {
    return <PageLayout heading="Loading..." children={undefined}></PageLayout>;
  }

  if (lab === undefined) {
    return (
      <PageLayout heading="Lab">
        <p className="text-4xl">Lab Not Found</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout heading={lab ? lab.name : "Lab"}>
      <TemplateCard>
        <LabCard lab={lab}>
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex justify-start gap-2">
                <LoadToBuilderButton lab={lab} variant="primary">
                  Open
                </LoadToBuilderButton>
                <ExportLabButton lab={lab} variant="secondary-text">
                  Export
                </ExportLabButton>
                <Button
                  variant={`${copied ? "success-text" : "secondary-text"}`}
                  onClick={() => copyLinkToLab(lab)}
                >
                  <span>
                    <FaShare />
                  </span>
                  {copied ? "Done" : "Share"}
                </Button>
              </div>
            </div>
          </>
        </LabCard>
      </TemplateCard>
    </PageLayout>
  );
}

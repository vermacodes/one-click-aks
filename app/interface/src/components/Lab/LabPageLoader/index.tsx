import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Lab } from "../../../dataStructures";
import {
  useSharedLabs,
  useSharedMockCases,
  useSharedTemplates,
  useTemplates,
} from "../../../hooks/useBlobs";
import LabPage from "../../../pages/LabPage";
import PageLayout from "../../../layouts/PageLayout";
import { useGetUserAssignedLabs } from "../../../hooks/useAssignment";

type Props = {};

export default function LabPageLoader({}: Props) {
  const { type, id } = useParams();
  const [lab, setLab] = useState<Lab | undefined>();

  const sharedTemplates = useSharedTemplates();
  const mockCases = useSharedMockCases();
  const myLabs = useTemplates();
  const readinessLabs = useSharedLabs();

  useEffect(() => {
    let labs;
    if (type === "sharedtemplate") {
      labs = sharedTemplates.data;
    } else if (type === "mockcase") {
      labs = mockCases.data;
    } else if (type === "template") {
      labs = myLabs.data;
    } else if (type === "labexercise") {
      labs = readinessLabs.data;
    }

    if (labs) {
      const foundLab = labs.find((lab) => lab.id === id);
      if (foundLab) {
        setLab(foundLab);
      }
    }
  }, [sharedTemplates, mockCases, myLabs, readinessLabs, type, id]);

  if (!lab) {
    return (
      <PageLayout heading="Lab">
        <div className="space-y-4">
          <p className="text-3xl">Well, nothing to show here.</p>
          <p>Do you have right access to see the details of this lab?</p>
        </div>
      </PageLayout>
    ); // or your custom loading component
  }

  return <LabPage lab={lab} />;
}

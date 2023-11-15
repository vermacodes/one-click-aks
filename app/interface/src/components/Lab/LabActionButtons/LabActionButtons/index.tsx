import { Lab } from "../../../../dataStructures";
import AssignmentActionButtons from "../AssignmentActionButtons";
import MockCaseActionButtons from "../MockCaseActionButtons";
import MySavedLabActionButtons from "../MySavedLabActionButtons";
import PublicLabActionButtons from "../PublicLabActionButtons";
import ReadinessLabActionButtons from "../ReadinessLabActionButtons";

type Props = {
  lab: Lab;
};

export default function LabActionButtons({ lab }: Props) {
  if (lab.type === "mockcase") {
    return <MockCaseActionButtons lab={lab} />;
  }

  if (lab.type === "sharedtemplate") {
    return <PublicLabActionButtons lab={lab} />;
  }

  if (lab.type === "labexercise") {
    return <ReadinessLabActionButtons lab={lab} />;
  }

  if (lab.type === "assignment") {
    return <AssignmentActionButtons lab={lab} />;
  }

  if (lab.type === "template") {
    return <MySavedLabActionButtons lab={lab} />;
  }

  return null;
}

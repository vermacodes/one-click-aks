import { Lab } from "../../../../dataStructures";
import AssignmentActionButtons from "../AssignmentActionButtons";
import ChallengeActionButtons from "../ChallengeActionButtons";
import ChallengeLabActionButtons from "../ChallengeLabActionButtons";
import MockCaseActionButtons from "../MockCaseActionButtons";
import MySavedLabActionButtons from "../MySavedLabActionButtons";
import PrivateLabActionButtons from "../PrivateLabActionButtons";
import PublicLabActionButtons from "../PublicLabActionButtons";
import ReadinessLabActionButtons from "../ReadinessLabActionButtons";

type Props = {
  lab: Lab;
};

const LAB_TYPE_COMPONENTS = {
  mockcase: MockCaseActionButtons,
  privatelab: PrivateLabActionButtons,
  publiclab: PublicLabActionButtons,
  readinesslab: ReadinessLabActionButtons,
  challengelab: ChallengeLabActionButtons,
  challenge: ChallengeActionButtons,
  assignment: AssignmentActionButtons,
  template: MySavedLabActionButtons,
};

export default function LabActionButtons({ lab }: Props) {
  const Component = LAB_TYPE_COMPONENTS[lab.type];

  if (Component) {
    return <Component lab={lab} />;
  }

  return null;
}

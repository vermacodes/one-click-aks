import { Lab } from "../../../../dataStructures";
import { useGetMyProfile } from "../../../../hooks/useProfile";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";

type Props = {
  lab: Lab;
  setLab: (lab: Lab) => void;
};

export default function SaveLabType({ lab, setLab }: Props) {
  const { data: profile } = useGetMyProfile();

  if (profile === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="labDescription" className="text-lg">
        Lab Type
      </label>
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={lab.type === "privatelab"}
          disabled={false}
          tooltipMessage="This will be saved privately in your storage account."
          id="privatelab"
          key={"privatelab"}
          label="Private Lab"
          handleOnChange={() => {
            setLab({ ...lab, type: "privatelab", category: "private" });
          }}
        />
        <Checkbox
          checked={lab.type === "challengelab"}
          disabled={false}
          tooltipMessage="This will be visible to you and other owners."
          id="challengelab"
          key={"challengelab"}
          label="Challenge Lab"
          handleOnChange={() => {
            setLab({ ...lab, type: "challengelab", category: "private" });
          }}
        />
        <Checkbox
          checked={lab.type === "publiclab"}
          disabled={
            !(
              profile.roles.includes("admin") ||
              profile.roles.includes("mentor") ||
              profile.roles.includes("contributor")
            )
          }
          tooltipMessage={
            !(
              profile.roles.includes("admin") ||
              profile.roles.includes("mentor") ||
              profile.roles.includes("contributor")
            )
              ? "You must be an admin, mentor, or contributor to create a public lab."
              : "Public labs are visible to all users."
          }
          id="publiclab"
          key={"publiclab"}
          label="Public Lab"
          handleOnChange={() =>
            setLab({ ...lab, type: "publiclab", category: "public" })
          }
        />
        <Checkbox
          checked={lab.type === "readinesslab"}
          disabled={
            !(
              profile.roles.includes("admin") ||
              profile.roles.includes("mentor")
            )
          }
          tooltipMessage={
            !(
              profile.roles.includes("admin") ||
              profile.roles.includes("mentor")
            )
              ? "You must be an admin or mentor to create a readiness lab."
              : "Use this to save lab as readiness lab."
          }
          id="readinesslab"
          key={"readinesslab"}
          label="Readiness Lab"
          handleOnChange={() =>
            setLab({ ...lab, type: "readinesslab", category: "protected" })
          }
        />
        <Checkbox
          checked={lab.type === "mockcase"}
          disabled={
            !(
              profile.roles.includes("admin") ||
              profile.roles.includes("mentor")
            )
          }
          tooltipMessage={
            !(
              profile.roles.includes("admin") ||
              profile.roles.includes("mentor")
            )
              ? "You must be an admin or mentor to create a mock case."
              : "Use this to save the lab as a mock case."
          }
          id="mockcase"
          key={"mockcase"}
          label="Mock Case"
          handleOnChange={() =>
            setLab({ ...lab, type: "mockcase", category: "protected" })
          }
        />
      </div>
    </div>
  );
}

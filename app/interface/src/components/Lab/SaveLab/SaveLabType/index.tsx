import { Lab } from "../../../../dataStructures";
import { useGetMyRoles } from "../../../../hooks/useAuth";
import Checkbox from "../../../UserInterfaceComponents/Checkbox";

type Props = {
  lab: Lab;
  setLab: (lab: Lab) => void;
};

export default function SaveLabType({ lab, setLab }: Props) {
  const { data: roles } = useGetMyRoles();

  if (roles === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="labDescription" className="text-lg">
        Lab Type
      </label>
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={lab.type === "template"}
          disabled={false}
          tooltipMessage="This will be saved privately in your storage account."
          id="template"
          key={"template"}
          label="My Lab"
          handleOnChange={() => {
            console.log("clicked");
            setLab({ ...lab, type: "template" });
          }}
        />
        <Checkbox
          checked={lab.type === "sharedtemplate"}
          disabled={
            !(
              roles.roles.includes("admin") ||
              roles.roles.includes("mentor") ||
              roles.roles.includes("contributor")
            )
          }
          tooltipMessage={
            !(
              roles.roles.includes("admin") ||
              roles.roles.includes("mentor") ||
              roles.roles.includes("contributor")
            )
              ? "You must be an admin, mentor, or contributor to create a public lab."
              : "Public labs are visible to all users."
          }
          id="sharedtemplate"
          key={"sharedtemplate"}
          label="Public Lab"
          handleOnChange={() => setLab({ ...lab, type: "sharedtemplate" })}
        />
        <Checkbox
          checked={lab.type === "labexercise"}
          disabled={
            !(roles.roles.includes("admin") || roles.roles.includes("mentor"))
          }
          tooltipMessage={
            !(roles.roles.includes("admin") || roles.roles.includes("mentor"))
              ? "You must be an admin or mentor to create a learning lab."
              : "Use this to save lab as learning lab."
          }
          id="labexercise"
          key={"labexercise"}
          label="Learning Lab"
          handleOnChange={() => setLab({ ...lab, type: "labexercise" })}
        />
        <Checkbox
          checked={lab.type === "mockcase"}
          disabled={
            !(roles.roles.includes("admin") || roles.roles.includes("mentor"))
          }
          tooltipMessage={
            !(roles.roles.includes("admin") || roles.roles.includes("mentor"))
              ? "You must be an admin or mentor to create a mock case."
              : "Use this to save the lab as a mock case."
          }
          id="mockcase"
          key={"mockcase"}
          label="Mock Case"
          handleOnChange={() => setLab({ ...lab, type: "mockcase" })}
        />
      </div>
    </div>
  );
}

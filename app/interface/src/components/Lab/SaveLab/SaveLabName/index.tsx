import { useRef, useState } from "react";
import { Lab } from "../../../../dataStructures";
import { labNameSchema } from "../../../../zodSchemas";

type Props = {
  lab: Lab;
  setLab(args: Lab): void;
};

export default function SaveLabName({ lab, setLab }: Props) {
  const [labNameError, setLabNameError] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleLabNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newLabName = event.target.value;
    const validationResult = labNameSchema.safeParse(newLabName);
    setLab({
      ...lab,
      name: newLabName,
    });
    setIsModified(true);

    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (validationResult.success) {
      setLabNameError("");
    } else {
      // Set timeout to display error message
      timeoutRef.current = setTimeout(() => {
        const errorMessages = validationResult.error.errors
          .map((err) => err.message)
          .join(" ");
        setLabNameError(errorMessages);
      }, 1000);
    }
  }

  return (
    <>
      <div className="flex flex-col ">
        <label htmlFor="labName" className="text-lg">
          Name
        </label>
        <input
          className="h-10 rounded border border-slate-500 bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          id="labName"
          type="text"
          placeholder="Lab Name"
          value={lab.name}
          onChange={(e) => handleLabNameChange(e)}
        />
      </div>
      {isModified && labNameError && (
        <div className="rounded border border-rose-500 bg-rose-500 bg-opacity-20 p-2">
          <p className="error-message">{labNameError}</p>
        </div>
      )}
    </>
  );
}

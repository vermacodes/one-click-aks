import { useRef, useState } from "react";
import { Lab } from "../../../../dataStructures";
import { z } from "zod";

type Props = {
  lab: Lab;
  setLab(args: Lab): void;
};

export default function SaveLabName({ lab, setLab }: Props) {
  const [labNameError, setLabNameError] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  //zod schema for lab name
  const labNameSchema = z
    .string()
    .min(3, "Lab name must be at least 3 characters.")
    .max(50, "Lab name must not exceed 50 characters.")
    .regex(
      /^[a-zA-Z0-9_-][a-zA-Z0-9 _-]*[a-zA-Z0-9_-]$/,
      "Lab name must only contain letters, numbers, spaces, underscores and dashes and must not start or end with a space."
    )
    .trim();

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
      }, 3000);
    }
  }

  return (
    <>
      <div className="flex flex-col ">
        <label htmlFor="labName" className="text-lg">
          Lab Name
        </label>
        <input
          className="h-10 rounded border border-slate-500 bg-slate-100 p-2 dark:bg-slate-800"
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

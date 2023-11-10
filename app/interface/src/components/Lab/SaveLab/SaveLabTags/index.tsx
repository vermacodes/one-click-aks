import { useState } from "react";
import { Lab } from "../../../../dataStructures";
import { FaTimes } from "react-icons/fa";
import { labTagSchema } from "../../../../zodSchemas";

type Props = {
  lab: Lab;
  setLab(args: Lab): void;
};

export default function SaveLabTags({ lab, setLab }: Props) {
  const [tagError, setTagError] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);
  const [tag, setTag] = useState<string>("");

  // Function to handle the form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If the tag is not valid, return
    if (!labTagSchema.safeParse(tag).success) {
      return;
    }

    setLab({ ...lab, tags: [...lab.tags, tag] });
    setTag("");
  };

  // Function to handle the input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tag = e.target.value;
    const validationResult = labTagSchema.safeParse(tag);
    setTag(tag.replace(" ", "_"));
    setIsModified(true);

    if (validationResult.success) {
      setTagError("");
    } else {
      const errorMessages = validationResult.error.errors
        .map((err) => err.message)
        .join(" ");
      setTagError(errorMessages);
    }
  };

  return (
    <div className="flex flex-col ">
      <label htmlFor="tags" className="text-lg">
        Tags
      </label>
      <div className="flex items-center gap-x-2 rounded border border-slate-500 bg-inherit focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-slate-200 dark:hover:bg-slate-700">
        <Tags lab={lab} setLab={setLab} />
        <form className="w-full" onSubmit={handleFormSubmit}>
          <input
            id="tags"
            type="text"
            value={tag}
            placeholder="Add tag"
            className="px w-full border-none bg-inherit p-2 py-2 outline-none"
            onChange={handleInputChange}
          />
        </form>
      </div>
      {isModified && tagError && (
        <div className="rounded border border-rose-500 bg-rose-500 bg-opacity-20 p-2">
          <p className="error-message">{tagError}</p>
        </div>
      )}
    </div>
  );
}

type TagsPros = {
  lab: Lab;
  setLab(args: Lab): void;
};

function Tags({ lab, setLab }: TagsPros) {
  function deleteTag(tagToBeDeleted: string) {
    var filteredTags = lab.tags.filter((tag) => tag !== tagToBeDeleted);
    setLab({ ...lab, tags: filteredTags });
  }

  return (
    <div className="flex flex-auto space-x-1 rounded px-2">
      {lab.tags &&
        lab.tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center justify-between gap-x-2 rounded border border-slate-500 bg-slate-500 p-1 px-2 text-lg text-slate-100"
          >
            {tag}
            <button
              className="max-h-fit max-w-fit rounded bg-slate-500 p-[2px] text-slate-100 hover:bg-rose-500"
              onClick={() => deleteTag(tag)}
            >
              <FaTimes />
            </button>
          </div>
        ))}
    </div>
  );
}

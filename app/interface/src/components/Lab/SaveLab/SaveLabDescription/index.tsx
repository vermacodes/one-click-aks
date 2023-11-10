import { useCallback, useState } from "react";
import { Lab } from "../../../../dataStructures";
import { z } from "zod";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import Button from "../../../UserInterfaceComponents/Button";
import {
  FaBold,
  FaHeading,
  FaItalic,
  FaLink,
  FaListUl,
  FaUnlink,
} from "react-icons/fa";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import { labDescriptionSchema } from "../../../../zodSchemas";

type Props = {
  lab: Lab;
  setLab(args: Lab): void;
};

export default function SaveLabDescription({ lab, setLab }: Props) {
  const [labDescriptionError, setLabDescriptionError] = useState<string>("");
  const [isModified, setIsModified] = useState<boolean>(false);

  function handleLabDescriptionChange(newLabDescription: string) {
    const validationResult = labDescriptionSchema.safeParse(newLabDescription);
    setLab({
      ...lab,
      description: newLabDescription,
    });
    setIsModified(true);
    if (validationResult.success) {
      setLabDescriptionError("");
    } else {
      const errorMessages = validationResult.error.errors
        .map((err) => err.message)
        .join(" ");
      setLabDescriptionError(errorMessages);
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      BulletList.configure({
        HTMLAttributes: {
          class: "ml-4 list-disc",
        },
      }),
      Link.configure({
        protocols: ["mailto", "http", "https"],
        HTMLAttributes: {
          class: "text-blue-500 underline hover:cursor-pointer",
        },
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
      }),
      Heading.configure({
        levels: [2],
        HTMLAttributes: {
          class: "font-bold text-xl",
        },
      }),
    ],
    content: lab.description,
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] h-fit rounded p-2 border border-slate-500 bg-slate-100 dark:bg-slate-800",
      },
    },
    onUpdate: ({ editor }) => {
      handleLabDescriptionChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (editor === null) {
      return;
    }
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (editor === null) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col space-y-2">
        <label htmlFor="labDescription" className="text-lg">
          Lab Description
        </label>
        <div className="flex space-x-1">
          <Button
            variant={
              editor.isActive("heading", { level: 2 })
                ? "secondary"
                : "secondary-outline"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <FaHeading />
          </Button>
          <Button
            variant={
              editor.isActive("bold") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FaBold />
          </Button>

          <Button
            variant={
              editor.isActive("italic") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FaItalic />
          </Button>
          <Button
            variant={
              editor.isActive("bulletList") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FaListUl />
          </Button>

          <Button
            onClick={setLink}
            variant={
              editor.isActive("link") ? "secondary" : "secondary-outline"
            }
          >
            <FaLink />
          </Button>
          <Button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            variant="secondary-outline"
          >
            <FaUnlink />
          </Button>
        </div>
        <EditorContent editor={editor} />
      </div>
      {isModified && labDescriptionError && (
        <div className="rounded border border-rose-500 bg-rose-500 bg-opacity-20 p-2">
          <p className="error-message">{labDescriptionError}</p>
        </div>
      )}
    </>
  );
}

import { useCallback, useState } from "react";
import { Lab } from "../../../../dataStructures";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import Button from "../../../UserInterfaceComponents/Button";
import {
  FaBold,
  FaCode,
  FaFileCode,
  FaHeading,
  FaItalic,
  FaLink,
  FaListUl,
  FaUnlink,
} from "react-icons/fa";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import { labDescriptionSchema } from "../../../../zodSchemas";
import { decodeIfEncoded } from "../../../../utils/helpers";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";

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
      description: btoa(newLabDescription),
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
          class: "ml-6 list-disc",
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
      Code.configure({
        HTMLAttributes: {
          class: "px-2 bg-slate-300 rounded dark:bg-slate-600",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class:
            "p-2 my-2 bg-slate-300 rounded dark:bg-slate-600 w-full break-words whitespace-pre-wrap",
        },
      }),
    ],
    content: decodeIfEncoded(lab.description),
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] h-fit rounded p-2 border border-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
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
        <label htmlFor="labDescription" className="line break-words text-lg">
          Description
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
            tooltipMessage="Heading"
            tooltipDelay={200}
            tooltipDirection="top"
          >
            <FaHeading />
          </Button>
          <Button
            variant={
              editor.isActive("bold") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleBold().run()}
            tooltipMessage="Bold"
            tooltipDelay={200}
            tooltipDirection="top"
          >
            <FaBold />
          </Button>
          <Button
            variant={
              editor.isActive("italic") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleItalic().run()}
            tooltipMessage="Italic"
            tooltipDelay={200}
            tooltipDirection="top"
          >
            <FaItalic />
          </Button>
          <Button
            variant={
              editor.isActive("code") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleCode().run()}
            tooltipMessage="Inline Code"
            tooltipDelay={200}
            tooltipDirection="top"
          >
            <FaCode />
          </Button>
          <Button
            variant={
              editor.isActive("codeBlock") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            tooltipMessage="Code Block"
            tooltipDelay={200}
            tooltipDirection="top"
          >
            <FaFileCode />
          </Button>
          <Button
            variant={
              editor.isActive("bulletList") ? "secondary" : "secondary-outline"
            }
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            tooltipMessage="Bullet List"
            tooltipDelay={200}
            tooltipDirection="top"
          >
            <FaListUl />
          </Button>
          <Button
            onClick={setLink}
            variant={
              editor.isActive("link") ? "secondary" : "secondary-outline"
            }
            tooltipMessage="Link"
            tooltipDelay={200}
            tooltipDirection="top"
          >
            <FaLink />
          </Button>
          <Button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            variant="secondary-outline"
            tooltipMessage="Unlink"
            tooltipDelay={200}
            tooltipDirection="top"
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

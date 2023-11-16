import { FaShare } from "react-icons/fa";
import { ButtonContainerObj, Lab } from "../../../../dataStructures";
import Button from "../../../UserInterfaceComponents/Button";
import ExportLabButton from "../../Export/ExportLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import DeleteLabButton from "../../DeleteLabButton";
import { useGetMyRoles } from "../../../../hooks/useAuth";
import ButtonContainer from "../ButtonContainer";

type Props = {
  lab: Lab;
};

export default function PublicLabActionButtons({ lab }: Props) {
  const { data: roles } = useGetMyRoles();
  const [buttons, setButtons] = useState<Record<string, ButtonContainerObj>>(
    {}
  );
  const [overflowButtons, setOverflowButtons] = useState<
    Record<string, ButtonContainerObj>
  >({});

  useEffect(() => {
    const initialButtons: Record<string, ButtonContainerObj> = {
      loadToBuilderButton: {
        id: "loadToBuilderButton",
        order: 1,
        button: (
          <LoadToBuilderButton
            key={"loadToBuilderButton"}
            lab={lab}
            variant="primary"
          >
            Open
          </LoadToBuilderButton>
        ),
      },
      exportLabButton: {
        id: "exportLabButton",
        order: 2,
        button: (
          <ExportLabButton
            key={"exportLabButton"}
            lab={lab}
            variant="secondary-text"
          >
            Export
          </ExportLabButton>
        ),
      },
      shareLabButton: {
        id: "shareLabButton",
        order: 3,
        button: (
          <Button variant="secondary-text" onClick={() => copyLinkToLab(lab)}>
            <span>
              <FaShare />
            </span>
            Share
          </Button>
        ),
      },
    };

    setButtons(initialButtons);
  }, [lab]);

  function upsertButton(button: ButtonContainerObj) {
    if (overflowButtons[button.id]) {
      console.log("overflow button", overflowButtons);
      setOverflowButtons((prevOverflowButtons) => {
        return { ...prevOverflowButtons, [button.id]: button };
      });
      return;
    }

    setButtons((prevButtons) => {
      return { ...prevButtons, [button.id]: button };
    });

    console.log("buttons", buttons);
  }

  function deleteButton(buttonId: string) {
    setButtons((prevButtons) => {
      const { [buttonId]: _, ...remainingButtons } = prevButtons;
      return remainingButtons;
    });
  }

  useEffect(() => {
    if (roles?.roles.includes("admin")) {
      const deleteButton: ButtonContainerObj = {
        id: "deleteLabButton",
        order: 4,
        button: (
          <DeleteLabButton
            lab={lab}
            key={"deleteLabButton"}
            variant="danger-text"
          >
            Delete
          </DeleteLabButton>
        ),
      };

      upsertButton(deleteButton);
    } else {
      deleteButton("deleteLabButton");
    }
  }, [roles, lab]);

  const copyLinkToLab = useCallback((lab: Lab) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/lab/sharedtemplate/${lab.id}`
    );

    toast.success("Link copied to clipboard.", {
      autoClose: 1000,
      toastId: "copy-link-to-lab",
    });

    const shareLabButtonSuccess: ButtonContainerObj = {
      id: "shareLabButton",
      order: 3,
      button: (
        <Button variant="success" onClick={() => copyLinkToLab(lab)}>
          <span>
            <FaShare />
          </span>
          Copied
        </Button>
      ),
    };

    const shareLabButton: ButtonContainerObj = {
      id: "shareLabButton",
      order: 3,
      button: (
        <Button variant="secondary-text" onClick={() => copyLinkToLab(lab)}>
          <span>
            <FaShare />
          </span>
          Share
        </Button>
      ),
    };

    upsertButton(shareLabButtonSuccess);
    setTimeout(() => {
      upsertButton(shareLabButton);
    }, 2000);
  }, []);

  return (
    <div className="flex flex-wrap justify-start gap-2">
      <ButtonContainer
        buttons={buttons}
        setButtons={setButtons}
        overflowButtons={overflowButtons}
        setOverflowButtons={setOverflowButtons}
      />
    </div>
  );
}

import { FaHistory, FaShare } from "react-icons/fa";
import { ButtonContainerObj, Lab } from "../../../../dataStructures";
import ExportLabButton from "../../Export/ExportLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import { useEffect, useState } from "react";
import DeleteLabButton from "../../DeleteLabButton";
import { useGetMyRoles } from "../../../../hooks/useAuth";
import ButtonContainer from "../ButtonContainer";
import CopyLinkToLabButton from "../../CopyLinkToLabButton";
import Versions from "../../LabVersions";

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
          <CopyLinkToLabButton key={"shareLabButton"} lab={lab}>
            <span>
              <FaShare />
            </span>
            Share
          </CopyLinkToLabButton>
        ),
      },
    };

    setButtons(initialButtons);
  }, [lab]);

  function upsertButton(button: ButtonContainerObj) {
    if (overflowButtons[button.id]) {
      setOverflowButtons((prevOverflowButtons) => {
        return { ...prevOverflowButtons, [button.id]: button };
      });
      //add some delay do avoid flickering. This is not the best solution.
      setTimeout(() => {}, 10);
      return;
    }

    setButtons((prevButtons) => {
      return { ...prevButtons, [button.id]: button };
    });
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

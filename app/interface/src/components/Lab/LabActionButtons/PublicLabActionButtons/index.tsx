import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { ButtonContainerObj, Lab } from "../../../../dataStructures";
import { useGetMyProfile } from "../../../../hooks/useProfile";
import CopyLinkToLabButton from "../../CopyLinkToLabButton";
import DeleteLabButton from "../../DeleteLabButton";
import ExportLabButton from "../../Export/ExportLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import ButtonContainer from "../ButtonContainer";

type Props = {
  lab: Lab;
};

export default function PublicLabActionButtons({ lab }: Props) {
  const { data: profile } = useGetMyProfile();
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
            variant="primary-outline"
          >
            Open in Builder
          </LoadToBuilderButton>
        ),
      },
      shareLabButton: {
        id: "shareLabButton",
        order: 2,
        button: (
          <CopyLinkToLabButton key={"shareLabButton"} lab={lab}>
            <span>
              <FaCopy />
            </span>
            Link to Lab
          </CopyLinkToLabButton>
        ),
      },
      exportLabButton: {
        id: "exportLabButton",
        order: 3,
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
    if (profile && lab.owners.includes(profile.userPrincipal)) {
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
  }, [profile, lab]);

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

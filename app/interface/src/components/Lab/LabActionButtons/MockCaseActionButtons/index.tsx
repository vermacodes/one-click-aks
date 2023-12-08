import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { ButtonContainerObj, Lab } from "../../../../dataStructures";
import { useGetMyProfile } from "../../../../hooks/useProfile";
import ApplyButton from "../../../Terraform/ActionButtons/ApplyButton";
import DestroyButton from "../../../Terraform/ActionButtons/DestroyButton";
import PlanButton from "../../../Terraform/ActionButtons/PlanButton";
import CopyLinkToLabButton from "../../CopyLinkToLabButton";
import DeleteLabButton from "../../DeleteLabButton";
import LoadToBuilderButton from "../../LoadToBuilderButton";
import ButtonContainer from "../ButtonContainer";

type Props = {
  lab: Lab;
};

export default function MockCaseActionButtons({ lab }: Props) {
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
      planButton: {
        id: "planButton",
        order: 2,
        button: (
          <PlanButton key={"planButton"} lab={lab} variant="success-text">
            Plan
          </PlanButton>
        ),
      },
      deployButton: {
        id: "deployButton",
        order: 3,
        button: (
          <ApplyButton key={"deployButton"} lab={lab} variant="primary-text">
            Deploy
          </ApplyButton>
        ),
      },
      destroyButton: {
        id: "destroyButton",
        order: 4,
        button: (
          <DestroyButton key={"destroyButton"} lab={lab} variant="danger-text">
            Destroy
          </DestroyButton>
        ),
      },
      shareLabButton: {
        id: "shareLabButton",
        order: 5,
        button: (
          <CopyLinkToLabButton
            key={"shareLabButton"}
            lab={lab}
            variant="secondary-text"
          >
            <span>
              <FaCopy />
            </span>
            Link to Lab
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
    if (profile && lab.owners.includes(profile.userPrincipal)) {
      const deleteButton: ButtonContainerObj = {
        id: "deleteLabButton",
        order: 6,
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

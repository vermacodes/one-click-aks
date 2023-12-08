import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Lab } from "../../../../../dataStructures";
import { useGetAllReadinessLabsRedacted } from "../../../../../hooks/useAssignment";
import DropdownSelect from "../../../../UserInterfaceComponents/DropdownSelect";
import FilterTextBox from "../../../../UserInterfaceComponents/FilterTextBox";

type Props = {
  selectedLabs: Lab[];
  setSelectedLabs: React.Dispatch<React.SetStateAction<Lab[]>>;
};
export default function SelectLabsDropdown({
  selectedLabs,
  setSelectedLabs,
}: Props) {
  const [uniqueLabs, setUniqueLabs] = useState<Lab[]>([]);
  const [labsSearchTerm, setLabsSearchTerm] = useState<string>("");

  const {
    data: labs,
    isLoading: labsLoading,
    isFetching: labsFetching,
  } = useGetAllReadinessLabsRedacted();

  /**
   * Effect hook to update the list of unique labs.
   *
   * This hook runs whenever the `labs` prop changes. It creates a new Set from the
   * current list of unique labs, then iterates over the `labs` array and adds each
   * lab to the Set. If the size of the Set has changed (indicating that new
   * unique labs were added), it updates the `uniqueLabs` state with the new Set.
   */
  useEffect(() => {
    if (labs) {
      const uniqueLabsSet = new Set(uniqueLabs);
      labs.forEach((lab) => {
        uniqueLabsSet.add(lab);
      });
      if (uniqueLabs.length !== uniqueLabsSet.size) {
        setUniqueLabs([...uniqueLabsSet]);
      }
    }
  }, [labs]);

  /**
   * Function to render a search input field.
   *
   * @returns JSX.Element - The rendered search input field.
   */
  const labSearchInput = () => {
    return (
      <div className="relative">
        <FilterTextBox
          placeHolderText="Filter by lab name"
          value={labsSearchTerm}
          onChange={(value: string) => setLabsSearchTerm(value)}
        />
        {/* <input
          type="text"
          placeholder="Search..."
          value={labsSearchTerm}
          onChange={(e) => setLabsSearchTerm(e.target.value)}
          className="w-full rounded px-2 py-1 dark:bg-slate-700 dark:text-slate-100"
        /> */}
        {labsSearchTerm && (
          <FaTimes
            className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer"
            onClick={() => setLabsSearchTerm("")}
          />
        )}
      </div>
    );
  };

  /**
   * Function to handle the click event on a lab.
   *
   * @param lab - The lab that was clicked.
   */
  const onLabClick = (lab: Lab) => {
    setSelectedLabs((selectedLabs) =>
      selectedLabs.includes(lab)
        ? selectedLabs.filter((i) => i !== lab)
        : [...selectedLabs, lab]
    );
  };

  /**
   * Function to handle the render of a lab in the dropdown menu.
   *
   * @param lab - The lab to assign.
   * @returns JSX.Element - The rendered lab in the dropdown.
   */
  const renderLab = (lab: Lab) => {
    const isSelected = selectedLabs.includes(lab);
    return (
      <div
        className={`relative ${
          isSelected
            ? "bg-green-500 bg-opacity-25 hover:bg-green-500 hover:bg-opacity-40 "
            : "hover:bg-sky-500 hover:bg-opacity-25 "
        } rounded `}
      >
        <p className="mt-1 cursor-pointer rounded p-2 hover:bg-opacity-40">
          {typeof lab === "string" ? lab : lab.name}
        </p>
        {isSelected && (
          <FaTimes className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer" />
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full">
      <DropdownSelect
        heading={
          selectedLabs.length > 0
            ? selectedLabs.length + " labs selected."
            : "Select Labs"
        }
        disabled={labsLoading || labsFetching}
        items={[
          ...selectedLabs,
          ...uniqueLabs
            .filter((lab) => !selectedLabs.includes(lab))
            .filter((lab) =>
              lab.name.toLowerCase().includes(labsSearchTerm.toLowerCase())
            ),
        ]}
        renderItem={renderLab}
        onItemClick={onLabClick}
        search={labSearchInput()}
        height={"h-96"}
        closeMenuOnSelect={false}
      />
    </div>
  );
}

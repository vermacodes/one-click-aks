import { useEffect, useState } from "react";
import DeleteAssignment from "../../components/Lab/Assignment/DeleteAssignment";
import { useGetAssignments } from "../../hooks/useAssignment";
import PageLayout from "../../layouts/PageLayout";
import Terminal from "../../components/Terminal";
import DropdownSelect from "../../components/UserInterfaceComponents/DropdownSelect";
import Button from "../../components/UserInterfaceComponents/Button";

type Props = {};

export default function Assignments({}: Props) {
  const { data: assignments } = useGetAssignments();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    document.title = "ACT Labs | Assignments";
  }, []);

  const onItemClick = (item: string) => {
    //if item is not in selectedItems, add it, else, remove it
    selectedItems.includes(item)
      ? setSelectedItems(selectedItems.filter((i) => i !== item))
      : setSelectedItems([...selectedItems, item]);
  };

  const renderItem = (item: string) => {
    if (selectedItems.includes(item)) {
      return <p className="font-bold text-sky-500 dark:text-sky-400">{item}</p>;
    }
    return <p>{item}</p>;
  };

  return (
    <PageLayout heading="Lab Assignments">
      <div className="mb-4 flex w-full justify-between gap-4 rounded bg-slate-50 p-2 shadow dark:bg-slate-900">
        <div className="flex w-full">
          <DropdownSelect
            heading={
              selectedItems.length > 0
                ? selectedItems.join(", ")
                : "Select Labs"
            }
            items={[
              "All",
              "Assigned",
              "Unassigned",
              "something",
              "something else",
              "even more",
              "I think even more",
              "something else",
              "even more",
              "I think even more",
              "I think even more",
              "something else",
              "even more",
              "I think even more",
            ]}
            renderItem={renderItem}
            onItemClick={onItemClick}
            searchEnabled={true}
            width={"full"}
            height={"h-96"}
          />
        </div>
        <div className="flex w-full">
          <DropdownSelect
            heading={
              selectedItems.length > 0
                ? selectedItems.join(", ")
                : "Select Labs"
            }
            items={[
              "All",
              "Assigned",
              "Unassigned",
              "something",
              "something else",
              "even more",
              "I think even more",
              "something else",
              "even more",
              "I think even more",
              "I think even more",
              "something else",
              "even more",
              "I think even more",
            ]}
            renderItem={renderItem}
            onItemClick={onItemClick}
            searchEnabled={true}
            width={"full"}
            height={"h-96"}
          />
        </div>
        <div className="flex">
          <Button variant="primary-outline">Assign</Button>
        </div>
      </div>
      <table className="h- w-full table-auto border-separate space-x-2 bg-slate-50 px-4 py-2 dark:bg-slate-900">
        <thead>
          <tr>
            <th className="space-x-2 px-4 py-2 text-left">Lab Name</th>
            <th className="space-x-2 px-4 py-2 text-left">User</th>
            <th className="space-x-2 px-4 py-2 text-left">Status</th>
            <th className="space-x-2 px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {assignments &&
            assignments.map((assignment) => (
              <tr
                key={assignment.id}
                className="hover:bg-slate-100 hover:dark:bg-slate-800"
              >
                <td className="space-x-2 px-4 py-2">{assignment.labName}</td>
                <td className="space-x-2 px-4 py-2">{assignment.user}</td>
                <td className="space-x-2 px-4 py-2">{assignment.status}</td>
                <td className="space-x-2 px-4 py-2">
                  <DeleteAssignment assignment={assignment} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <Terminal />
    </PageLayout>
  );
}

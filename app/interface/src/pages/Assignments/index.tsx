import Button from "../../components/Button";
import DeleteAssignment from "../../components/Lab/Assignment/DeleteAssignment";
import {
  useDeleteAssignment,
  useGetAssignments,
} from "../../hooks/useAssignment";

type Props = {};

export default function Assignments({}: Props) {
  const { data: assignments } = useGetAssignments();
  const deleteAssignment = useDeleteAssignment();

  return (
    <div className="gap-y-10">
      <h1 className="my-2 mb-6 border-b-2 border-slate-500 py-4 text-4xl">
        Lab Assignments
      </h1>
      <table className="w-full table-auto border-collapse  items-center space-x-2 border border-slate-500 px-4 py-2">
        <thead>
          <tr>
            <th className="border-collapse  items-center space-x-2 border border-slate-500 px-4 py-2">
              Lab Name
            </th>
            <th className="border-collapse  items-center space-x-2 border border-slate-500 px-4 py-2">
              User
            </th>
            <th className="border-collapse  items-center space-x-2 border border-slate-500 px-4 py-2">
              Status
            </th>
            <th className="border-collapse items-center space-x-2 border  border-slate-500 px-4 py-2">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {assignments &&
            assignments.map((assignment) => (
              <tr>
                <td className="border-collapse items-center space-x-2 border  border-slate-500 px-4 py-2">
                  {assignment.labName}
                </td>
                <td className="border-collapse items-center space-x-2 border  border-slate-500 px-4 py-2">
                  {assignment.user}
                </td>
                <td className="border-collapsespace-x-2 items-center  border  border-slate-500 px-4 py-2">
                  {assignment.status}
                </td>
                <td className="border-collapse items-center space-x-2 border  border-slate-500 px-4 py-2">
                  <DeleteAssignment assignment={assignment} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

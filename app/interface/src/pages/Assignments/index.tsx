import Button from "../../components/Button";
import DeleteAssignment from "../../components/Lab/Assignment/DeleteAssignment";
import {
  useDeleteAssignment,
  useGetAssignments,
} from "../../hooks/useAssignment";
import PageLayout from "../../layouts/PageLayout";

type Props = {};

export default function Assignments({}: Props) {
  const { data: assignments } = useGetAssignments();
  const deleteAssignment = useDeleteAssignment();

  return (
    <PageLayout heading="Lab Assignments">
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
    </PageLayout>
  );
}

import { useEffect } from "react";
import DeleteAssignment from "../../components/Lab/Assignment/DeleteAssignment";
import { useGetAssignments } from "../../hooks/useAssignment";
import PageLayout from "../../layouts/PageLayout";
import Terminal from "../../components/Terminal";
import CreateAssignmentNew from "../../components/Lab/Assignment/CreateAssignmentNew";
import Container from "../../components/UserInterfaceComponents/Container";

type Props = {};

export default function Assignments({}: Props) {
  const { data: assignments } = useGetAssignments();

  useEffect(() => {
    document.title = "ACT Labs | Assignments";
  }, []);

  return (
    <PageLayout heading="Lab Assignments">
      <div className="flex flex-col gap-4">
        <CreateAssignmentNew />
        <Container title="All Assignments" collapsible={true}>
          <table className="w-full table-auto border-separate space-x-2 bg-slate-50 py-2 dark:bg-slate-900">
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
                    <td className="space-x-2 px-4 py-2">
                      {assignment.labName}
                    </td>
                    <td className="space-x-2 px-4 py-2">{assignment.user}</td>
                    <td className="space-x-2 px-4 py-2">{assignment.status}</td>
                    <td className="space-x-2 px-4 py-2">
                      <DeleteAssignment assignment={assignment} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Container>
      </div>
      <Terminal />
    </PageLayout>
  );
}

import PageLayout from "../../layouts/PageLayout";

export default function Feedback() {
  return (
    <PageLayout>
      <iframe
        className="h-screen w-full max-w-full overflow-hidden py-4"
        src="https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRzY0DairMyJDrbQ9kViEZ25UMzdFWExRM0NZR1lUTlJRSFhIQUc0V1RIMi4u&embed=true"
      />
    </PageLayout>
  );
}

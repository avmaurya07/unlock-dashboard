import ListingManager from "./ListingManager";

export default function Jobs() {
  return (
    <ListingManager
      typeKey="jobs"
      title="Jobs"
      subtitle="All your job postings (mock data for now)"
      addButtonText="Add New Job"
      searchKeys={["title", "company", "location"]}
      fields={[
        { name: "title", label: "Job Title", required: true, col: "col-md-6" },
        { name: "company", label: "Company Name", required: true, col: "col-md-6" },
        { name: "location", label: "Location", col: "col-md-6" },
        {
          name: "jobType",
          label: "Job Type",
          type: "select",
          col: "col-md-6",
          options: [
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "internship", label: "Internship" },
            { value: "remote", label: "Remote" },
          ],
        },
        { name: "salaryRange", label: "Salary Range", col: "col-md-6", placeholder: "e.g. 6–10 LPA" },
        { name: "deadline", label: "Apply Deadline", type: "date", col: "col-md-6" },
        { name: "description", label: "Job Description", type: "textarea", required: true, col: "col-12" },
      ]}
      sampleData={[
        { _id: "j1", title: "React Developer", company: "TechNova", location: "Remote", jobType: "remote", salaryRange: "8–12 LPA", status: "approved", createdAt: new Date().toISOString() },
        { _id: "j2", title: "Marketing Intern", company: "GrowthLab", location: "Mumbai", jobType: "internship", status: "pending", createdAt: new Date().toISOString() },
      ]}
    />
  );
}

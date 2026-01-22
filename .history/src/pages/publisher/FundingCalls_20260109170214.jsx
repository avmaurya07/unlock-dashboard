import ListingManager from "./ListingManager";

export default function FundingCalls() {
  return (
    <ListingManager
      typeKey="funding"
      title="Startup Funding Calls"
      subtitle="Funding opportunities you post (mock for now)"
      addButtonText="Add Funding Call"
      searchKeys={["title", "stage", "location"]}
      fields={[
        { name: "title", label: "Funding Call Title", required: true, col: "col-12" },
        { name: "stage", label: "Startup Stage", col: "col-md-6", placeholder: "Pre-seed / Seed / Series A" },
        { name: "fundingAmount", label: "Funding Amount", col: "col-md-6", placeholder: "e.g. $50k–$200k" },
        { name: "location", label: "Location", col: "col-md-6" },
        { name: "deadline", label: "Deadline", type: "date", col: "col-md-6" },
        { name: "description", label: "Details", type: "textarea", required: true, col: "col-12" },
      ]}
      sampleData={[
        { _id: "f1", title: "Seed Funding – SaaS", stage: "Seed", fundingAmount: "$100k–$250k", location: "India", status: "approved", createdAt: new Date().toISOString() },
        { _id: "f2", title: "Pre-seed – AI Products", stage: "Pre-seed", fundingAmount: "$25k–$75k", location: "Online", status: "pending", createdAt: new Date().toISOString() },
      ]}
    />
  );
}

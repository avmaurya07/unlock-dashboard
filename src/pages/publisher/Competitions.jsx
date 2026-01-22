import ListingManager from "./ListingManager";

export default function Competitions() {
  return (
    <ListingManager
      typeKey="competitions"
      title="Competitions"
      subtitle="Competitions & challenges you list (mock for now)"
      addButtonText="Add Competition"
      searchKeys={["title", "mode", "prize"]}
      fields={[
        { name: "title", label: "Competition Title", required: true, col: "col-12" },
        {
          name: "mode",
          label: "Mode",
          type: "select",
          col: "col-md-6",
          options: [
            { value: "online", label: "Online" },
            { value: "offline", label: "Offline" },
            { value: "hybrid", label: "Hybrid" },
          ],
        },
        { name: "prize", label: "Prize", col: "col-md-6", placeholder: "e.g. ₹1,00,000" },
        { name: "deadline", label: "Deadline", type: "date", col: "col-md-6" },
        { name: "location", label: "Location", col: "col-md-6" },
        { name: "description", label: "Details", type: "textarea", required: true, col: "col-12" },
      ]}
      sampleData={[
        { _id: "c1", title: "Hackathon 2026", mode: "online", prize: "₹1,00,000", status: "approved", createdAt: new Date().toISOString() },
        { _id: "c2", title: "Business Plan Challenge", mode: "hybrid", prize: "Mentorship + Funding", status: "pending", createdAt: new Date().toISOString() },
      ]}
    />
  );
}

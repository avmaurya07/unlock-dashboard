import ListingManager from "./ListingManager";

export default function Events() {
  return (
    <ListingManager
      typeKey="events"
      title="Events"
      subtitle="All your event listings (mock data for now)"
      addButtonText="Add New Event"
      searchKeys={["title", "location"]}
      fields={[
        { name: "title", label: "Event Title", required: true, col: "col-12" },
        { name: "location", label: "Location", col: "col-md-6" },
        { name: "startDate", label: "Start Date", type: "date", col: "col-md-6" },
        { name: "endDate", label: "End Date", type: "date", col: "col-md-6" },
        { name: "deadline", label: "Deadline", type: "date", col: "col-md-6" },
        { name: "description", label: "Description", type: "textarea", required: true, col: "col-12" },
      ]}
      sampleData={[
        { _id: "e1", title: "Startup Pitch Night", location: "Chandigarh", startDate: "2026-01-15", endDate: "2026-01-15", deadline: "2026-01-12", status: "approved", createdAt: new Date().toISOString() },
        { _id: "e2", title: "Founder Meetup", location: "Delhi", startDate: "2026-01-22", endDate: "2026-01-22", status: "pending", createdAt: new Date().toISOString() },
      ]}
    />
  );
}

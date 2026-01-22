import ListingManager from "./ListingManager";

export default function InvestorPrograms() {
  return (
    <ListingManager
      typeKey="investorPrograms"
      title="Investor Programs"
      subtitle="Programs you host or share (mock for now)"
      addButtonText="Add Investor Program"
      searchKeys={["title", "sectors", "location"]}
      fields={[
        { name: "title", label: "Program Title", required: true, col: "col-12" },
        { name: "ticketSize", label: "Ticket Size", col: "col-md-6", placeholder: "e.g. $50k–$500k" },
        { name: "sectors", label: "Preferred Sectors", col: "col-md-6", placeholder: "Fintech, SaaS, EV..." },
        { name: "location", label: "Location", col: "col-md-6" },
        { name: "deadline", label: "Deadline", type: "date", col: "col-md-6" },
        { name: "description", label: "Details", type: "textarea", required: true, col: "col-12" },
      ]}
      sampleData={[
        { _id: "ip1", title: "Angel Network Program", ticketSize: "$25k–$100k", sectors: "SaaS, D2C", location: "Delhi", status: "approved", createdAt: new Date().toISOString() },
        { _id: "ip2", title: "VC Office Hours", ticketSize: "$100k–$1M", sectors: "AI, Fintech", location: "Online", status: "pending", createdAt: new Date().toISOString() },
      ]}
    />
  );
}

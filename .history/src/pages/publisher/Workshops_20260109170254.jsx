import ListingManager from "./ListingManager";

export default function Services() {
  return (
    <ListingManager
      typeKey="services"
      title="Services"
      subtitle="Service listings (yearly plan item) — mock for now"
      addButtonText="Add Service"
      searchKeys={["title", "category"]}
      fields={[
        { name: "title", label: "Service Title", required: true, col: "col-md-6" },
        { name: "category", label: "Category", col: "col-md-6", placeholder: "Tech / Civil / Automotive..." },
        { name: "yearlyFee", label: "Yearly Fee", col: "col-md-6", placeholder: "e.g. ₹9,999", type: "text" },
        { name: "location", label: "Location", col: "col-md-6" },
        { name: "description", label: "Details", type: "textarea", required: true, col: "col-12" },
      ]}
      sampleData={[
        { _id: "s1", title: "Startup Legal Support", category: "Legal", yearlyFee: "₹9,999", location: "India", status: "approved", createdAt: new Date().toISOString() },
        { _id: "s2", title: "Pitch Deck Design", category: "Design", yearlyFee: "₹5,999", location: "Online", status: "pending", createdAt: new Date().toISOString() },
      ]}
    />
  );
}

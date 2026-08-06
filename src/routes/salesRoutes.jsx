import CustomerComplaintMaster from "../components/sales/CustomerComplaint/CustomerComplaintMaster";
import RejectionInvoiceMaster from "../components/sales/RejectionInvoice/RejectionInvoiceMaster";

const salesRoutes = [
  {
    path: "/customercomplaintescalation",
    label: "Customer Complaint Entry",
    element: <CustomerComplaintMaster />,
  },
  {
    path: "/rejectioninvoice",
    label: "Rejection Invoice",
    element: <RejectionInvoiceMaster />,
  },
];

export default salesRoutes;

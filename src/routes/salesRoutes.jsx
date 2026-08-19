import CustomerComplaintMaster from "../components/sales/CustomerComplaint/CustomerComplaintMaster";
import RejectionInvoiceMaster from "../components/sales/RejectionInvoice/RejectionInvoiceMaster";
import SalesInvoiceMaster from "../components/sales/SalesInvoice/SalesInvoiceMaster";
import SalesOrderShortCloseMaster from "../components/sales/salesOrderShortClose/SalesOrderShortCloseMaster";

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
  {
    path: "/salesordershortclose",
    label: "Sales Order Short-Close",
    element: <SalesOrderShortCloseMaster />,
  },
   {
    path: "/salesordershortclose",
    label: "Sales Order Short-Close",
    element: <SalesOrderShortCloseMaster />,
  },
  {
    path: "/salesrejectioninvoice",
    label: "Sales Rejection Invoice",
    element: <SalesInvoiceMaster />,
  },
];

export default salesRoutes;

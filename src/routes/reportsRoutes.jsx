import OrderAcceptanceForApprovalList from "../components/Reports/orderacceptanceforapproval/OrderAcceptanceForApprovalList";
import ReportsMaster from "../components/Reports/ReportsList";
import SalesContractForApprovalList from "../components/Reports/SalesContractForApproval/SalesContractForApprovalList";

const reportsRoutes = [
  {
    path: "/reports",
    label: "Reports",
    keywords: ["Reports", "Report"],
    element: <ReportsMaster />,
  },
  {
    path: "/orderacceptanceforapproval",
    label: "OrderAcceptanceForApproval",
    keywords: ["Order Acceptance For Approval", "Order Acceptance"],
    element: <OrderAcceptanceForApprovalList />,
  },
  {
    path: "/salescontractforapproval",
    label: "SalesContractForApproval",
    keywords: ["Sales Contract For Approval", "Sales Contract"],
    element: <SalesContractForApprovalList />,
  },
];

export default reportsRoutes;

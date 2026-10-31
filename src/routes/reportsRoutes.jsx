import OrderAcceptanceForApprovalList from "../components/Reports/orderacceptanceforapproval/OrderAcceptanceForApprovalList";
import ReportsMaster from "../components/Reports/ReportsList";

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
];

export default reportsRoutes;

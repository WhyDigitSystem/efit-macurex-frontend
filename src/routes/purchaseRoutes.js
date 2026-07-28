import PurchaseContractMaster from "../components/purchase/purchaseContract/PurchaseContractMaster";
import PurchaseIndentMaster from "../components/purchase/purchaseIndent/PurchaseIndentMaster";
import PurchaseDeliveryMaster from "../components/purchase/purchaseDeliverySchedule/PurchaseDeliveryMaster";
const purchaseRoutes = [
  {
    path: "/purchaseindent",
    label: "Purchase Indent",
    element: <PurchaseIndentMaster />,
  },
  {
    path: "/purchasecontractopen",
    label: "Purchase Contract Open",
    element: <PurchaseContractMaster />,
  },
  {
    path: "/purchasedeliveryschedule",
    label: "Purchase Contract Open",
    element: <PurchaseDeliveryMaster />,
  },
];

export default purchaseRoutes;

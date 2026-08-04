import PurchaseContractMaster from "../components/purchase/purchaseContract/PurchaseContractMaster";
import PurchaseIndentMaster from "../components/purchase/purchaseIndent/PurchaseIndentMaster";
import PurchaseDeliveryMaster from "../components/purchase/purchaseDeliverySchedule/PurchaseDeliveryMaster";

import PoShortCloseMaster from "../components/purchase/poDelvSch/PoShortCloseMaster";
import PurchaseBill from "../components/purchase/purchaseBill/PurchaseBill";
import LocalPurchaseOrderMaster from "../components/purchase/localPurchaseOrder/LocalPurchaseOrderMaster";
import ExcelPurchaseOrderMaster from "../components/purchase/excelPurchaseOrder/ExcelPurchaseOrderMaster";

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
  {
    path: "/purchasebill",
    label: "Purchase Bill",
    element: <PurchaseBill />,
  },
  {
    path: "/purchaseordershortclose",
    label: "P.O./Delv.Sch. Shortclose",
    element: <PoShortCloseMaster />,
  },
  {
    path: "/localpurchaseorder",
    label: "Local Purchase Order",
    element: <LocalPurchaseOrderMaster />,
  },
  {
    path: "/excelpurchaseorder",
    label: "Excel Purchase Order",
    element: <ExcelPurchaseOrderMaster />,
  },

];

export default purchaseRoutes;

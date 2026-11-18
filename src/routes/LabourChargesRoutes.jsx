import LCDeliverySchedule from "../components/labourCharges/LCDeliverySchedule/LCDeliverySchedule";
import LCDespatchInstruction from "../components/labourCharges/LCDespatchInstruction/LCDespatchInstruction";
import LCInvoice from "../components/labourCharges/LCInvoice/LCInvoice";
import LCMaterialReturn from "../components/labourCharges/LCMaterialReturn/LCMaterialReturn";
import LCPurchaseOrder from "../components/labourCharges/LCPurchaseOrder/LCPurchaseOrder";
import LCPurchaseOrderShortClose from "../components/labourCharges/LCPurchaseOrderShortClose/LCPurchaseOrderShortClose";
import MaterialReceiptsLC from "../components/labourCharges/MaterialReceiptsLC/MaterialReceiptsLC";

const labourChargesRoutes = [
  {
    path: "/lcpurchaseorder",
    label: "LC Purchase Order",
    element: <LCPurchaseOrder />,
  },
  {
    path: "/materialreceiptslc",
    label: "Material Receipts LC",
    element: <MaterialReceiptsLC />,
  },
  {
    path: "/lcinvoicetaxinvoice",
    label: "LC Invoice Tax Invoice",
    element: <LCInvoice />,
  },
  {
    path: "/lcdeliveryschedule",
    label: "LC Delivery Schedule",
    element: <LCDeliverySchedule />,
  },
  {
    path: "/lcpurchaseordershortclose",
    label: "LC Purchase Order Short Close",
    element: <LCPurchaseOrderShortClose />,
  },
  {
    path: "/lcdespatchinstruction",
    label: "LC Despatch Instruction",
    element: <LCDespatchInstruction />,
  },
  {
    path: "/lcmaterialreturn",
    label: "LC Material Return",
    element: <LCMaterialReturn />,
  },
];

export default labourChargesRoutes;

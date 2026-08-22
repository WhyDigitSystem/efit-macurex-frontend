import BulkIssueIndentMaster from "../components/Production/BulkIssueIndent/BulkIssueIndentMaster";
import ConsumptionEntryMaster from "../components/Production/ConsumptionEntry/ConsumptionEntryMaster";
import FGTransferSlipMaster from "../components/Production/FGTransferSlip/FGTransferSlipMaster";
import MaterialIndentForProduction from "../components/Production/MaterialIndentForProduction/MaterialIndentForProduction";
import ProcessValidationEntryMaster from "../components/Production/ProcessValidationEntry/ProcessValidationEntryMaster";
import ProductionEntry from "../components/Production/ProductionEntry/ProductionEntry";
import ProductionScheduleOrder from "../components/Production/ProductionScheduleOrder/ProductionScheduleOrder";
import ProductionTransferSlip from "../components/Production/ProductionTransferSlip/ProductionTransferSlip";

const productionRoutes = [
  {
    path: "/productionscheduleorder",
    label: "Production Schedule Order",
    element: <ProductionScheduleOrder />,
  },
  {
    path: "/materialindentproduction",
    label: "Material Indent for Production",
    element: <MaterialIndentForProduction />,
  },
  {
    path: "/productionentry",
    label: "Production Entry",
    element: <ProductionEntry />,
  },
  {
    path: "/productiontransferslip",
    label: "Production Transfet Slip",
    element: <ProductionTransferSlip />,
  },
  {
    path: "/fgtransferslipentry",
    label: "FG Transfer Slip Entry",
    element: <FGTransferSlipMaster />,
  },
  {
    path: "/consumptionentry",
    label: "Consumption Entry",
    element: <ConsumptionEntryMaster />,
  },
  {
    path: "/processvalidationentry",
    label: "Process Validation Entry",
    element: <ProcessValidationEntryMaster />,
  },
  {
    path: "/bulkissueindent",
    label: "Bulk Issue Indent",
    element: <BulkIssueIndentMaster />,
  },
];

export default productionRoutes;

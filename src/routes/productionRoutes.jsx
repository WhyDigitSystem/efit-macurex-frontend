import BulkIssueIndentMaster from "../components/Production/BulkIssueIndent/BulkIssueIndentMaster";
import ConsumptionEntryMaster from "../components/Production/ConsumptionEntry/ConsumptionEntryMaster";
import FGTransferSlipMaster from "../components/Production/FGTransferSlip/FGTransferSlipMaster";
import MachineSettingPlan from "../components/Production/MachineSettingPlan/machineSettingPlan";
import MaterialIndentForProduction from "../components/Production/MaterialIndentForProduction/MaterialIndentForProduction";
import MTRNMaster from "../components/Production/MaterialTransferReturnNote/MTRNMaster";
import ProcessValidationEntryMaster from "../components/Production/ProcessValidationEntry/ProcessValidationEntryMaster";
import ProductionEntry from "../components/Production/ProductionEntry/ProductionEntry";
import ProductionScheduleOrder from "../components/Production/ProductionScheduleOrder/ProductionScheduleOrder";
import ProductionTransferSlip from "../components/Production/ProductionTransferSlip/ProductionTransferSlip";
import ProductionIssueMaster from "../components/Production/ProductionIssue/ProductionIssueMaster";
import ScheduleOrderShortCloseMaster from "../components/Production/ScheduleOrderShortClose/ScheduleOrderShortCloseMaster";
import ReconcileConsumptionStock from "../components/Production/ReconcileConsumptionStock/reconcileConsumptionStock";
import ScrapNoteMaster from "../components/Production/ScrapNote/ScrapNoteMaster";
import StockOrderMaster from "../components/Production/StockOrder/StockOrderMaster";

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
  {
    path: "/materialtransferreturnnote",
    label: "Material Transfer/Return Note",
    element: <MTRNMaster />,
  },
  {
    path: "/scrapnote",
    label: "Scrap Note",
    element: <ScrapNoteMaster />,
  },
  {
    path: "/productionscheduleordershortclosed",
    label: "Production Sch. Order ShortClosed",
    element: <ScheduleOrderShortCloseMaster />,
  },
  {
    path: "/stockorder",
    label: "Stock Order",
    element: <StockOrderMaster />,
  },
  {
    path: "/reconcileconsumptionstock",
    label: "Reconcile Consumption Stock",
    element: <ReconcileConsumptionStock />,
  },
  {
    path: "/machinesettingplan",
    label: "Machine Setting Plan",
    element: <MachineSettingPlan />,
  },
  {
    path: "/productionissues",
    label: "Production Issues",
    element: <ProductionIssueMaster />,
  },
];

export default productionRoutes;

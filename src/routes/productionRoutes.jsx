import MaterialIndentForProduction from "../components/Production/MaterialIndentForProduction/MaterialIndentForProduction";
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
];

export default productionRoutes;

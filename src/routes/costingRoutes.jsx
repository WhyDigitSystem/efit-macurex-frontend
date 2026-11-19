import ProductCosting from "../components/costing/ProductCosting/ProductCosting";
import CostRateMaster from "../components/costing/CostRateMaster/CostRateMaster";
import WorkingDaysCalculation from "../components/Costing/WorkingDaysCalculation/WorkingDaysCalculation";
import LocationCostMaster from "../components/Costing/LocationCostMaster/LocationCostMaster";
import MachineHourRateMaster from "../components/Costing/MachineHourRateMaster/MachineHourRateMaster";
import LabourHourRate from "../components/Costing/LabourHourRate/LabourHourRate";

const costingRoutes = [
  {
    path: "/productcosting",
    label: "Product Costing/Pricing",
    element: <ProductCosting />,
  },
  {
    path: "/costratemaster",
    label: "Cost Rate Master",
    element: <CostRateMaster />,
  },
  {
    path: "/workingdayscalculation",
    label: "Working Days Calculation",
    element: <WorkingDaysCalculation />,
  },
  {
    path: "/locationcostmaster",
    label: "Location Cost Master",
    element: <LocationCostMaster />,
  },
  {
    path: "/machinehourratemaster",
    label: "Machine Hour Rate Master",
    element: <MachineHourRateMaster />,
  },
  {
    path: "/labourhourrate",
    label: "Labour Hour Rate",
    element: <LabourHourRate />,
  },
];

export default costingRoutes;

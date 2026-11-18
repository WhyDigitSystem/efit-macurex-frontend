import ProductCosting from "../components/costing/ProductCosting/ProductCosting";
import CostRateMaster from "../components/costing/CostRateMaster/CostRateMaster";

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
];

export default costingRoutes;

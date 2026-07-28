import InternalIndentMaster from "../components/inventory/internalIndent/InternalIndentMaster";
import StockTransferMaster from "../components/inventory/stockTransfer/StockTransferMaster";

const inventoryRoutes = [
  {
    path: "/stocktransfer",
    label: "Stock Transfer",
    element: <StockTransferMaster />,
  },
  {
    path: "/internalindent",
    label: "Internal Indent",
    element: <InternalIndentMaster />,
  },
];

export default inventoryRoutes;

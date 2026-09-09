import InternalIndentMaster from "../components/inventory/internalIndent/InternalIndentMaster";
import IssueMaster from "../components/inventory/issue/IssueMaster";
import PhysicalStockReconciliationMaster from "../components/inventory/physicalStockReconciliation/PhysicalStockReconciliationMaster";
import StockTransferMaster from "../components/inventory/stockTransfer/StockTransferMaster";
import StockTransferGRNMaster from "../components/inventory/stockTransferGRN/StockTransferGRNMaster";
import GoodsReceivedNoteMaster from "../components/inventory/GoodsReceivedNote/GoodsReceivedNoteMaster";
import OpeningStockEntryMaster from "../components/inventory/openingStockEntry/OpeningStockEntryMaster";

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
  {
    path: "/issues",
    label: "Issues",
    element: <IssueMaster />,
  },
  {
    path: "/physicalstockreconciliation",
    label: "Physical Stock Reconciliation",
    element: <PhysicalStockReconciliationMaster />,
  },
  {
    path: "/stocktransfergrn",
    label: "Stock Transfer GRN",
    element: <StockTransferGRNMaster />,
  },
  {
    path: "/goodsreceivednote",
    label: "Good Sreceived Note",
    element: <GoodsReceivedNoteMaster />,
  },
  {
    path: "/openstockentrymaster",
    label: "Open Stock Entry Master",
    element: <OpeningStockEntryMaster />,
  },
];

export default inventoryRoutes;

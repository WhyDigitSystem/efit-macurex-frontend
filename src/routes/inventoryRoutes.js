import InternalIndentMaster from "../components/inventory/internalIndent/InternalIndentMaster";
import IssueMaster from "../components/inventory/issue/IssueMaster";
import PhysicalStockReconciliationMaster from "../components/inventory/physicalStockReconciliation/PhysicalStockReconciliationMaster";
import ReceiptMaster from "../components/inventory/receipt/ReceiptMaster";
import StockTransferMaster from "../components/inventory/stockTransfer/StockTransferMaster";
import SubContractingGrnMaster from "../components/inventory/subContractingGrn/SubContractingGrnMaster";

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
    path: "/receipts",
    label: "Receipts",
    element: <ReceiptMaster />,
  },
  {
    path: "/subcontractinggrn",
    label: "Sub contracting GRN",
    element: <SubContractingGrnMaster />,
  },
];

export default inventoryRoutes;

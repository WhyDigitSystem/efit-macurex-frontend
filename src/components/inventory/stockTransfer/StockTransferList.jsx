import { useCallback, useEffect, useState } from "react";
import stockTransferAPI from "../../../api/Inventory/stockTransferAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const StockTransferList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [transferData, setTransferData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadTransfers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await stockTransferAPI.getStockTransferByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setTransferData(sortedData);
    } catch (error) {
      console.error("Failed to load stock transfers:", error);
      setTransferData([]);
      toast.error("Failed to fetch stock transfers");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers, refreshTrigger]);

  const columns = [
    {
      key: "stockTransferNo",
      label: "Stock Transfer No",
      accessor: (row) => row.header?.stockTransferNo,
      type: "text",
    },
    {
      key: "stockTransferDate",
      label: "Stock Transfer Date",
      accessor: (row) => row.header?.stockTransferDate,
      type: "date",
    },
    {
      key: "fromPlantId",
      label: "From Plant ID",
      accessor: (row) => row.header?.fromPlantId,
      type: "text",
    },
    {
      key: "toPlant",
      label: "To Plant",
      accessor: (row) => row.header?.toPlant,
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => row.header?.fromLocation,
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => row.header?.toLocation,
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = [
    "header.stockTransferNo",
    "header.fromPlantId",
    "header.toPlant",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Stock Transfer"
        data={transferData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Stock Transfers found"
        loadingMessage="Loading Stock Transfers..."
        enableRefresh={true}
        onRefresh={loadTransfers}
        enableExport={true}
        exportFileName="StockTransfers"
      />
    </div>
  );
};

export default StockTransferList;

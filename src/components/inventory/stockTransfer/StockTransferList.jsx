import { useCallback, useEffect, useState } from "react";
import stockTransferAPI from "../../../api/Inventory/stockTransferAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const StockTransferList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [transferData, setTransferData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadTransfers = useCallback(async () => {
    if (!ORG_ID) return;
    try {
      setLoading(true);

      const response = await stockTransferAPI.getStockTransferByOrgId(ORG_ID, BRANCH_ID);
      console.log("Stock Transfer List Response:", response);

      // Extract data from response
      let data = [];
      if (response?.paramObjectsMap?.stockTransferResponseVO) {
        data = response.paramObjectsMap.stockTransferResponseVO;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.data?.paramObjectsMap?.stockTransferResponseVO) {
        data = response.data.paramObjectsMap.stockTransferResponseVO;
      }

      // Map the data to match the table columns
      const mappedData = data.map((item) => ({
        id: item.id,
        stockTransferNo: item.docId || "",
        stockTransferDate: item.docDate || "",
        fromPlantId: item.branch?.branchName || item.branch?.branchCode || "",
        toPlant: item.toBranch?.branchName || item.toBranch?.branchCode || "",
        fromLocation: item.fromLocation?.locationName || "",
        toLocation: item.toLocation?.locationName || "",
        belongsTo: item.belongsTo || "",
        reason: item.reason || "",
        narration: item.narration || "",
        active: item.active || "Inactive",
        createdBy: item.createdBy || "",
        // Store full data for edit
        _fullData: item,
      }));

      // Sort by ID descending (newest first)
      mappedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setTransferData(mappedData);
    } catch (error) {
      console.error("Failed to load stock transfers:", error);
      setTransferData([]);
      toast.error("Failed to fetch stock transfers");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers, refreshTrigger]);

  const columns = [
    {
      key: "stockTransferNo",
      label: "Stock Transfer No",
      accessor: "stockTransferNo",
      type: "text",
    },
    {
      key: "stockTransferDate",
      label: "Stock Transfer Date",
      accessor: "stockTransferDate",
      type: "text",
    },
    {
      key: "fromPlantId",
      label: "From Plant",
      accessor: "fromPlantId",
      type: "text",
    },
    {
      key: "toPlant",
      label: "To Plant",
      accessor: "toPlant",
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: "fromLocation",
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: "toLocation",
      type: "text",
    },
    {
      key: "reason",
      label: "Reason",
      accessor: "reason",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
      statusVariants: {
        Active: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        Inactive: {
          label: "Inactive",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        },
      },
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
    "stockTransferNo",
    "fromPlantId",
    "toPlant",
    "fromLocation",
    "toLocation",
    "reason",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "Active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "Inactive",
      activeValue: "Active",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Stock Transfer"
        data={transferData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
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
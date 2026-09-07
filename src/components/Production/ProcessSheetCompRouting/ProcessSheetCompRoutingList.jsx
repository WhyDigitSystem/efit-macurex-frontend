import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import processSheetCompRoutingAPI from "../../../api/Production/processSheetCompRoutingAPI";
import { toast } from "../../../utils/toast";

const ProcessSheetCompRoutingList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    try {
      setLoading(true);
      const list = await processSheetCompRoutingAPI.getByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      const sorted = [...(Array.isArray(list) ? list : [])].sort(
        (a, b) => Number(b?.id || 0) - Number(a?.id || 0),
      );
      setData(sorted);
    } catch (error) {
      console.error("Failed to load process sheet / routing records:", error);
      setData([]);
      toast.error("Failed to fetch Process Sheet / Routing records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const headerOf = (row, key, fallback) => row?.header?.[key] ?? row?.[key] ?? fallback;

  const columns = [
    {
      key: "plant",
      label: "Plant",
      accessor: (row) =>
        row?.plantName ||
        row?.branch?.branchName ||
        headerOf(row, "plantName", "") ||
        headerOf(row, "plantId", ""),
      type: "text",
    },
    {
      key: "itemType",
      label: "Item Type",
      accessor: (row) => headerOf(row, "fgSfgItemType", ""),
      type: "text",
    },
    {
      key: "itemCode",
      label: "FG/SFG Item Code",
      accessor: (row) => headerOf(row, "fgSfgItemCode", ""),
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) => headerOf(row, "itemDescription", ""),
      type: "text",
    },
    {
      key: "bomId",
      label: "BOM ID",
      accessor: (row) => headerOf(row, "bomId", ""),
      type: "text",
    },
    {
      key: "drawingNo",
      label: "Drawing No",
      accessor: (row) => headerOf(row, "drawingNo", ""),
      type: "text",
    },
    {
      key: "costRateId",
      label: "Cost Rate ID",
      accessor: (row) => headerOf(row, "costRateId", ""),
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
    "fgSfgItemCode",
    "itemDescription",
    "bomId",
    "drawingNo",
    "costRateId",
  ];

  return (
    <CommonListViewTable
      title="Process Sheet / Component Routing Master"
      data={data}
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
      emptyMessage="No process sheet / routing records found"
      loadingMessage="Loading process sheet / routing records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="ProcessSheetCompRouting"
    />
  );
};

export default ProcessSheetCompRoutingList;
import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionScheduleOrderShortCloseAPI from "../../../api/Production/productionScheduleOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const ScheduleOrderShortCloseList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadRecords = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;
    try {
      setLoading(true);
      const data =
        await productionScheduleOrderShortCloseAPI.getByOrgIdAndBranch({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch Short Close records:", error);
      setRecords([]);
      toast.error("Failed to fetch Production Schedule Order Short Closes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* ---------------- Accessors ---------------- */

  const getBranchLabel = (row) =>
    row?.branch?.branchName ||
    row?.branch?.branchCode ||
    row?.branch?.id ||
    "";

  const getItemCode = (row) => row?.item?.itemCode || row?.item?.id || "";

  const getItemDescription = (row) => row?.item?.itemDescription || "";

  const getUnitLabel = (row) =>
    row?.unit?.unitId || row?.unit?.id || "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "docId",
      label: "Short Close No",
      accessor: (row) => row?.docId || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Date",
      accessor: (row) => row?.docDate || "",
      type: "date",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Branch",
      accessor: (row) => getBranchLabel(row),
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: (row) => getItemCode(row),
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) => getItemDescription(row),
      type: "text",
    },
    {
      key: "unit",
      label: "Unit",
      accessor: (row) => getUnitLabel(row),
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row?.active === true || row?.active === "Active"
          ? "Active"
          : "Inactive",
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
      width: "120px",
    },
  ];

  const searchFields = [
    "docId",
    "docDate",
    "branch.branchName",
    "item.itemCode",
    "item.itemDescription",
    "narration",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Production Schedule Order Short-Closed"
      data={records}
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
      emptyMessage="No Short Close records found"
      loadingMessage="Loading Short Close records..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default ScheduleOrderShortCloseList;
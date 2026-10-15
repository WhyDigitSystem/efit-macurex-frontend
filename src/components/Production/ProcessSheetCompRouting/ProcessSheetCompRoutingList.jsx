import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import processSheetCompRoutingAPI from "../../../api/Production/processSheetCompRoutingAPI";
import { toast } from "../../../utils/toast";

const isActive = (v) => v === true || v === "Active";

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
      // normalise to flat, searchable rows
      const rows = (Array.isArray(list) ? list : []).map((r) => ({
        ...r,
        docId: r.docId || r.processSheetCompRoutingDocId || "",
        plantName: r.branch?.branchName || r.plantName || "",
        itemCode:
          r.fgSfgItemCode?.itemCode ??
          r.itemCode ??
          (typeof r.fgSfgItemCode !== "object" ? r.fgSfgItemCode : ""),
        bomDocId: r.bom?.docId ?? r.bomDocId ?? "",
        statusText: isActive(r.active) ? "Active" : "Inactive",
      }));
      rows.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));
      setData(rows);
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

  const columns = [
    {
      key: "docId",
      label: "Doc. No.",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    { key: "plantName", label: "Plant", accessor: "plantName", type: "text" },
    {
      key: "fgSfgItemType",
      label: "Item Type",
      accessor: "fgSfgItemType",
      type: "text",
    },
    {
      key: "itemCode",
      label: "FG/SFG Item Code",
      accessor: "itemCode",
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: "itemDescription",
      type: "text",
    },
    { key: "bomDocId", label: "BOM ID", accessor: "bomDocId", type: "text" },
    {
      key: "totalOperationValue",
      label: "Total Operation Value",
      accessor: "totalOperationValue",
      type: "text",
      align: "right",
    },
    {
      key: "statusText",
      label: "Status",
      accessor: "statusText",
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
    "docId",
    "plantName",
    "fgSfgItemType",
    "itemCode",
    "itemDescription",
    "bomDocId",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "statusText",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "statusText",
      filterValue: "inactive",
      activeValue: "Inactive",
    },
  ];

  return (
    <CommonListViewTable
      title="Process Sheet / Component Routing"
      data={data}
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

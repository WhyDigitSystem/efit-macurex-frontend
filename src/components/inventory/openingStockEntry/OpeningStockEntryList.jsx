import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import openingStockEntryAPI from "../../../api/Inventory/openingStockEntryAPI";
import { toast } from "../../../utils/toast";

const OpeningStockEntryList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadStockEntries = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      console.warn("orgId or branchId missing from localStorage");
      setStockData([]);
      return;
    }

    try {
      setLoading(true);
      const list = await openingStockEntryAPI.getByOrgId(ORG_ID, BRANCH_ID);
      const sorted = [...(Array.isArray(list) ? list : [])].sort(
        (a, b) => Number(b?.id || 0) - Number(a?.id || 0),
      );
      setStockData(sorted);
    } catch (error) {
      console.error("Failed to load opening stock entries:", error);
      setStockData([]);
      toast.error("Failed to fetch Opening Stock Entry records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadStockEntries();
  }, [loadStockEntries, refreshTrigger]);

  const columns = [
    {
      key: "plant",
      label: "Plant",
      accessor: (row) =>
        row?.plantName ||
        row?.branch?.branchName ||
        row?.header?.plantName ||
        row?.header?.branch?.branchName ||
        "",
      type: "text",
    },
    {
      key: "asOnDate",
      label: "As On Date",
      accessor: (row) =>
        String(row?.asOnDate || row?.header?.asOnDate || "").slice(0, 10),
      type: "text",
    },
    {
      key: "location",
      label: "Location",
      accessor: (row) =>
        row?.locationName ||
        row?.location?.locationName ||
        row?.header?.locationName ||
        "",
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: (row) =>
        row?.itemCode ||
        row?.stockDetails?.[0]?.itemCode ||
        row?.header?.itemCode ||
        "",
      type: "text",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      accessor: (row) =>
        row?.itemDescription ||
        row?.stockDetails?.[0]?.itemDescription ||
        "",
      type: "text",
    },
    {
      key: "quantity",
      label: "Quantity",
      accessor: (row) =>
        row?.quantity ?? row?.stockDetails?.[0]?.quantity ?? "",
      type: "text",
    },
    {
      key: "rate",
      label: "Rate",
      accessor: (row) => row?.rate ?? row?.stockDetails?.[0]?.rate ?? "",
      type: "text",
    },
    {
      key: "amount",
      label: "Amount",
      accessor: (row) => row?.amount ?? row?.stockDetails?.[0]?.amount ?? "",
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

  const searchFields = ["plantName", "locationName", "itemCode", "itemDescription", "asOnDate"];

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
      title="Opening Stock Entry"
      data={stockData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      filterInHeader={true}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No opening stock entries found"
      loadingMessage="Loading opening stock entries..."
      enableRefresh={true}
      onRefresh={loadStockEntries}
      enableExport={true}
      exportFileName="OpeningStockEntry"
    />
  );
};

export default OpeningStockEntryList;
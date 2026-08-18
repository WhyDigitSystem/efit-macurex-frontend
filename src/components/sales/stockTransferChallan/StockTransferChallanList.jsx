import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import stockTransferChallanAPI from "../../../api/Sales/stockTranferChallanAPI";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const StockTransferChallanList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 0;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await stockTransferChallanAPI.getStockTransferChallanByOrgId(ORG_ID, BRANCH);
      // Sort by id descending (newest first)
      const sorted = (res || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Stock Transfer Challan records:", error);
      setData([]);
      toast.error("Failed to fetch Stock Transfer Challan records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadData();
    }
  }, [refreshTrigger, loadData]);

  const columns = [
    {
      key: "docId",
      label: "Doc ID",
      accessor: (row) => row.docId || row.docId || "-",
      type: "text",
      noWrap: true
    },
    {
      key: "docDate",
      label: "Transfer Date",
      accessor: (row) => row.docDate || row.date || row.docDate,
      type: "date",
      noWrap: true
    },
    {
      key: "customer",
      label: "Customer",
      accessor: (row) => row.customer?.customerName || row.customerName,
      type: "text"
    },
    {
      key: "branch",
      label: "Branch",
      accessor: (row) => row.branch?.branchName || row.branchName || row.plantId,
      type: "text"
    },
    {
      key: "location",
      label: "Location",
      accessor: (row) => row.location?.locationName || row.locationId,
      type: "text",
      noWrap: true
    },
    {
      key: "noOfPackages",
      label: "Packages",
      accessor: (row) => row.noOfPackages,
      type: "text",
      noWrap: true
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    { key: "actions", label: "Actions", type: "actions", align: "center", width: "90px" },
  ];

  const searchFields = [
    "docId",
    "customer.customerName",
    "customerName",
    "branch.branchName",
    "branchName",
    "location.locationName",
    "locationId"
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
  ];

  return (
    <CommonListViewTable
      title="Stock Transfer Challan"
      subtitle="Manage Stock Transfer Challans"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={(row) => onEdit(row)}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Stock Transfer Challan records found"
      loadingMessage="Loading Stock Transfer Challan records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="StockTransferChallan"
    />
  );
};

export default StockTransferChallanList;
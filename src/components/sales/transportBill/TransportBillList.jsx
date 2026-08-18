import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import transportBillAPI from "../../../api/Sales/transportBillAPI";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const TransportBillList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId"));
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await transportBillAPI.getAll(ORG_ID, BRANCH);
      // Transform data to handle nested objects
      const transformedData = (res || []).map((item) => ({
        ...item,
        // If transportName is an object, extract the name
        transportName: typeof item.transportName === 'object'
          ? item.transportName?.transportName || item.transportName?.name || JSON.stringify(item.transportName)
          : item.transportName || "",
        // If receivedBy is an object, extract the name
        receivedBy: typeof item.receivedBy === 'object'
          ? item.receivedBy?.employeeName || item.receivedBy?.name || JSON.stringify(item.receivedBy)
          : item.receivedBy || "",
        // If accReceivedBy is an object, extract the name
        accReceivedBy: typeof item.accReceivedBy === 'object'
          ? item.accReceivedBy?.employeeName || item.accReceivedBy?.name || JSON.stringify(item.accReceivedBy)
          : item.accReceivedBy || "",
        // If plantId is an object, extract the name
        plantId: typeof item.plantId === 'object'
          ? item.plantId?.branchName || item.plantId?.name || JSON.stringify(item.plantId)
          : item.plantId || "",
      }));
      const sorted = (transformedData || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Transport Bill records:", error);
      setData([]);
      toast.error("Failed to fetch Transport Bill records");
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
    { key: "docNo", label: "Doc No", accessor: "docNo", type: "text", noWrap: true },
    { key: "docDate", label: "Doc Date", accessor: "docDate", type: "date", noWrap: true },
    {
      key: "transportName",
      label: "Transport Name",
      accessor: "transportName",
      type: "text",
      noWrap: true
    },
    { key: "billNo", label: "Bill No", accessor: "billNo", type: "text", noWrap: true },
    { key: "billDate", label: "Bill Date", accessor: "billDate", type: "date", noWrap: true },
    { key: "totalAmount", label: "Total Amount", accessor: "totalAmount", type: "text", noWrap: true },
    {
      key: "active", label: "Status", accessor: "active",
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

  const searchFields = ["docNo", "transportName", "billNo", "plantId"];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
  ];

  return (
    <CommonListViewTable
      title="Transport Bill"
      subtitle="Manage Transport Bills"
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
      emptyMessage="No Transport Bill records found"
      loadingMessage="Loading Transport Bill records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="TransportBill"
    />
  );
};

export default TransportBillList;
import { useCallback, useEffect, useRef, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import otherSalesInvoiceAPI from "../../../api/Sales/otherSalesInvoiceAPI";
import { toast } from "../../../utils/toast";
 
const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const OtherSalesInvoiceList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;
  const prevRefreshRef = useRef(refreshTrigger);

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await otherSalesInvoiceAPI.getAll(ORG_ID, BRANCH);
      const sorted = (res || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Other Sales Invoice records:", error);
      setData([]);
      toast.error("Failed to fetch Other Sales Invoice records");
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
    { key: "salesInvoiceNo", label: "Invoice No", accessor: "salesInvoiceNo", type: "text", noWrap: true },
    { key: "invoiceDate", label: "Invoice Date", accessor: "invoiceDate", type: "text", noWrap: true },
    { key: "customerName", label: "Customer", accessor: "customerName", type: "text" },
    { key: "plantId", label: "Plant", accessor: "plantId", type: "text" },
    { key: "belongsTo", label: "Belongs To", accessor: "belongsTo", type: "text" },
    { key: "currency", label: "Currency", accessor: "currency", type: "text", noWrap: true },
    { key: "grossAmount", label: "Gross Amount", accessor: "grossAmount", type: "text", noWrap: true },
    {
      key: "active", label: "Status", accessor: "active",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActive
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

  const searchFields = ["salesInvoiceNo", "customerName", "plantId", "belongsTo"];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
  ];

  return (
    <CommonListViewTable
      title="Other Sales Invoice"
      subtitle="Manage Other Sales Invoices"
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
      emptyMessage="No Other Sales Invoice records found"
      loadingMessage="Loading Other Sales Invoice records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="OtherSalesInvoice"
    />
  );
};

export default OtherSalesInvoiceList;

import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import apiClient from "../../../api/apiClient";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const DirectPurchaseList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await apiClient.get("/api/dev/getDirectPurchaseMasterByOrgId", {
        params: { orgId: ORG_ID, branch: BRANCH },
      });
      const list = res?.paramObjectsMap?.directPurchaseMasterList || [];
      const sorted = (list || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Direct Purchase records:", error);
      setData([]);
      toast.error("Failed to fetch Direct Purchase records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    { key: "docNo", label: "Doc No", accessor: "docNo", type: "text", noWrap: true },
    { key: "docDate", label: "Doc Date", accessor: "docDate", type: "text", noWrap: true },
    { key: "supplierName", label: "Supplier", accessor: "supplierName", type: "text" },
    { key: "invNo", label: "Inv No", accessor: "invNo", type: "text", noWrap: true },
    { key: "invDate", label: "Inv Date", accessor: "invDate", type: "text", noWrap: true },
    { key: "plantId", label: "Plant", accessor: "plantId", type: "text" },
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

  const searchFields = ["docNo", "supplierName", "invNo", "plantId"];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
  ];

  return (
    <CommonListViewTable
      title="Direct Purchase"
      subtitle="Manage Direct Purchase Entries"
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
      emptyMessage="No Direct Purchase records found"
      loadingMessage="Loading Direct Purchase records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="DirectPurchase"
    />
  );
};

export default DirectPurchaseList;

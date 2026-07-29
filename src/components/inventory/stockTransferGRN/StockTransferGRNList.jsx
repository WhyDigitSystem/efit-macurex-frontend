import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import apiClient from "../../../api/apiClient";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const StockTransferGRNList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const res = await apiClient.get("/api/dev/getStockTransferGRNMasterByOrgId", {
        params: { orgId: ORG_ID, branch: BRANCH },
      });
      const list = res?.paramObjectsMap?.stockTransferGRNMasterList || [];
      const sorted = (list || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load Stock Transfer GRN records:", error);
      setData([]);
      toast.error("Failed to fetch Stock Transfer GRN records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    { key: "grnNo", label: "GRN No", accessor: "grnNo", type: "text", noWrap: true },
    { key: "grnDate", label: "GRN Date", accessor: "grnDate", type: "text", noWrap: true },
    { key: "supplierName", label: "Supplier", accessor: "supplierName", type: "text" },
    { key: "plantId", label: "Plant", accessor: "plantId", type: "text" },
    { key: "gatePassNo", label: "Gate Pass", accessor: "gatePassNo", type: "text", noWrap: true },
    { key: "poNo", label: "PO/PC No", accessor: "poNo", type: "text", noWrap: true },
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

  const searchFields = ["grnNo", "supplierName", "gatePassNo", "poNo", "plantId"];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active", filterFn: (item) => normalizeActive(item.active) },
    { value: "inactive", label: "Inactive", filterFn: (item) => !normalizeActive(item.active) },
  ];

  return (
    <CommonListViewTable
      title="Stock Transfer GRN"
      subtitle="Manage Stock Transfer Goods Receipt Notes"
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
      emptyMessage="No Stock Transfer GRN records found"
      loadingMessage="Loading Stock Transfer GRN records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="StockTransferGRN"
    />
  );
};

export default StockTransferGRNList;

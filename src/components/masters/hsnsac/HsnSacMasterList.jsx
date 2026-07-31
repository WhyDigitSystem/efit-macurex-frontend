import { useEffect, useState, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import hsnSacAPI from "../../../api/hsnSacAPI";
import { useToast } from "../../Toast/ToastContext";

const CATEGORY_MAP = { 1: "Goods", 2: "Services" };

const resolveCategory = (value) => {
  if (value == null) return "-";
  if (typeof value === "object") {
    if (value.listCode === "GOODS") return "Goods";
    if (value.listCode === "SERVICE") return "Services";
    return value.valueDescription;
  }
  if (typeof value === "number") return CATEGORY_MAP[value] || String(value);
  return String(value);
};

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const HsnSacMasterList = ({ onAddNew, onEdit, onBack }) => {
  const { addToast } = useToast();
  const [hsnSacData, setHsnSacData] = useState([]);
  const [loading, setLoading] = useState(false);
  const orgId = Number(localStorage.getItem("orgId")) || 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const branchId = localStorage.getItem("branchId");

      const data = await hsnSacAPI.getAll(orgId, branchId);
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setHsnSacData(data);
    } catch (error) {
      console.error("Failed to load HSN/SAC data:", error);
      setHsnSacData([]);
      addToast("Failed to load HSN/SAC data.", "error");
    } finally {
      setLoading(false);
    }
  }, [orgId, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const columns = [
    {
      key: "category",
      label: "Category",
      accessor: "category",
      render: (value) => {
        const label = resolveCategory(value);
        return <span className="text-xs text-gray-900 dark:text-white">{label}</span>;
      },
      noWrap: true,
    },
    {
      key: "hsn",
      label: "HSN/SAC Code",
      accessor: "hsn",
      type: "text",
      noWrap: true,
    },
    {
      key: "description",
      label: "Description",
      accessor: "description",
      type: "text",
      noWrap: false,
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
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

  const searchFields = ["category", "hsn", "description"];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      filterFn: (item) => normalizeActive(item.active),
    },
    {
      value: "inactive",
      label: "Inactive",
      filterFn: (item) => !normalizeActive(item.active),
    },
  ];

  return (
    <CommonListViewTable
      title="HSN/SAC Master"
      subtitle="Manage HSN & SAC Codes"
      data={hsnSacData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No HSN/SAC records found"
      loadingMessage="Loading HSN/SAC records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="HSN_SAC_Master"
    />
  );
};

export default HsnSacMasterList;

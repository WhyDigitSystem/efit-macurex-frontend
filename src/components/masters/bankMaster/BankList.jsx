import React, { useEffect, useState, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import bankAPI from "../../../api/bankAPI";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const BankList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [bankData, setBankData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const loadBanks = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const data = await bankAPI.getAll(ORG_ID);
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setBankData(data);
    } catch (error) {
      console.error("Failed to load banks:", error);
      setBankData([]);
      toast.error("Failed to fetch Banks");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks, refreshTrigger]);

  const handleEdit = (bank) => {
    onEdit(bank);
  };

  const handleView = (row) => {
    onEdit(row);
  };

  const columns = [
    {
      key: "beneficiary",
      label: "Beneficiary Name",
      accessor: "beneficiary",
      type: "text",
    },
    {
      key: "bank",
      label: "Bank Name",
      accessor: "bank",
      type: "text",
    },
    {
      key: "acno",
      label: "AC No",
      accessor: "acno",
      type: "text",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Branch",
      accessor: "branch",
      type: "text",
    },
    {
      key: "ifscCode",
      label: "IFSC Code",
      accessor: "ifscCode",
      type: "text",
      noWrap: true,
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

  const searchFields = ["beneficiary", "bank", "acno", "branch", "ifscCode"];

  const filterOptions = [
    { value: "all", label: "All" },
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
      title="Bank Master"
      data={bankData}
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
      emptyMessage="No Bank records found"
      loadingMessage="Loading Bank records..."
      enableRefresh={true}
      onRefresh={loadBanks}
      enableExport={true}
      exportFileName="Bank_Master"
    />
  );
};

export default BankList;

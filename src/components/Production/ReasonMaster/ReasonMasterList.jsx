import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import reasonMasterAPI from "../../../api/Production/reasonMasterAPI";
import { toast } from "../../../utils/toast";

const resolveLabel = (value) => {
  if (value && typeof value === "object") {
    return (
      value.reasonName ||
      value.valuesDescription ||
      value.departmentName ||
      value.name ||
      value.id
    );
  }
  return value;
};

const ReasonMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reasonMasterAPI.getAll(ORG_ID, BRANCH_ID);
      const sorted = (data || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(sorted);
    } catch (error) {
      console.error("Failed to load reason masters:", error);
      setRecords([]);
      toast.error("Failed to fetch Reason Masters");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "department",
      label: "Department",
      accessor: (row) => resolveLabel(row.department),
      type: "text",
      noWrap: true,
    },
    {
      key: "reason",
      label: "Reason",
      accessor: (row) => resolveLabel(row.reason),
      type: "text",
    },
    {
      key: "reasonCode",
      label: "Reason Code",
      accessor: (row) =>
        row.reasonCode || row.reasoncode || row.code || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "reasonDescription",
      label: "Reason Description",
      accessor: (row) =>
        row.reasonDescription || row.reasondescription || row.description || "",
      type: "text",
    },
    {
      key: "narration",
      label: "Narration",
      accessor: (row) => row.narration || "",
      type: "text",
    },
    {
      key: "status",
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

  const searchFields = [
    "reasonCode",
    "reasonDescription",
    "narration",
    "reason",
    "department",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "Active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "Inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Reason Master"
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
      emptyMessage="No Reason Master records found"
      loadingMessage="Loading Reason Master records..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="ReasonMaster"
    />
  );
};

export default ReasonMasterList;
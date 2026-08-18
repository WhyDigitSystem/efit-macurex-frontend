import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesContractAmendmentAPI from "../../../api/Sales/salesContractAmendmentAPI";
import { toast } from "../../../utils/toast";

const SalesContractAmendmentList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await salesContractAmendmentAPI.getAll(
        Number(ORG_ID) || 0,
        Number(BRANCH_ID) || 1000000001,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load SC amendments:", error);
      setRecords([]);
      toast.error("Failed to fetch Sales Contract Amendments");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "contractAmdNo",
      label: "Contract Amd No",
      accessor: "contractAmdNo",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date || row.partyPoAmdDate || "",
      type: "text",
    },
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
      type: "text",
    },
    {
      key: "custPoNo",
      label: "Cust. P.O. No",
      accessor: (row) => row.custPoNo || row.custPONo || "",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.id
          : row.plantName || row.branch || "",
      type: "text",
    },
    {
      key: "revisionNo",
      label: "Revision",
      accessor: "revisionNo",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) => (row.active !== false ? "Active" : "Inactive"),
      type: "status",
      statusVariants: {
        Active:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        Inactive:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
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
    "contractAmdNo",
    "contractNo",
    "custPoNo",
    "custPONo",
    "revisionNo",
  ];

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
      title="Sales Contract Amendment"
      subtitle="Manage sales contract amendments and revisions"
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
      emptyMessage="No Sales Contract Amendments found"
      loadingMessage="Loading Sales Contract Amendments..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SalesContractAmendments"
    />
  );
};

export default SalesContractAmendmentList;
import { useState, useEffect, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesContractAmendmentAPI from "../../../api/Sales/salesContractAmendmentAPI";

const SalesContractAmendmentList = ({ onAdd, onEdit }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await salesContractAmendmentAPI.getAll(orgId, branch);
      setData(list);
    } catch (error) {
      console.error("Failed to load SC amendments:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, branch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    { key: "sno", label: "#", type: "text" },
    { key: "contractAmdNo", label: "Contract Amd No", type: "text", accessor: (row) => row.contractAmdNo || "" },
    { key: "date", label: "Date", type: "text", accessor: (row) => row.date || "" },
    { key: "contractNo", label: "Contract No", type: "text", accessor: (row) => row.contractNo || "" },
    { key: "custPONo", label: "Cust. P.O. No", type: "text", accessor: (row) => row.custPONo || "" },
    { key: "revisionNo", label: "Revision", type: "text", accessor: (row) => row.revisionNo || "" },
    {
      key: "status",
      label: "Status",
      type: "status",
      accessor: (row) => (row.active !== false ? "Active" : "Inactive"),
      statusVariants: {
        Active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        Inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      onEdit: (row) => onEdit(row),
    },
  ];

  const searchFields = ["contractAmdNo", "contractNo", "custPONo"];

  return (
    <CommonListViewTable
      title="Sales Contract Amendment"
      subtitle="Manage sales contract amendments and revisions"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onAddNew={onAdd}
      onEdit={onEdit}
      emptyMessage="No SC amendments found"
    />
  );
};

export default SalesContractAmendmentList;

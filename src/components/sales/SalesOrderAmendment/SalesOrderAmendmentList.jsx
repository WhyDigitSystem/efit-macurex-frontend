import { useState, useEffect, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesOrderAmendmentAPI from "../../../api/Sales/salesOrderAmendmentAPI";

const SalesOrderAmendmentList = ({ onAdd, onEdit }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await salesOrderAmendmentAPI.getAll(orgId, branch);
      setData(list);
    } catch (error) {
      console.error("Failed to load SO amendments:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, branch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    { key: "sno", label: "#", type: "text" },
    { key: "soAmndNo", label: "S.O.Amnd No", type: "text", accessor: (row) => row.soAmndNo || "" },
    { key: "date", label: "Date", type: "text", accessor: (row) => row.date || "" },
    { key: "soNo", label: "S.O.No", type: "text", accessor: (row) => row.soNo || "" },
    { key: "partyPOAmdNo", label: "Party P.O.Amnd No", type: "text", accessor: (row) => row.partyPOAmdNo || "" },
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

  const searchFields = ["soAmndNo", "soNo", "partyPOAmdNo"];

  return (
    <CommonListViewTable
      title="Sales Order Amendment"
      subtitle="Manage sales order amendments and revisions"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onAddNew={onAdd}
      onEdit={onEdit}
      emptyMessage="No SO amendments found"
    />
  );
};

export default SalesOrderAmendmentList;

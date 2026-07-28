import { useState, useEffect, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import purchaseOrderAmendmentAPI from "../../../api/Purchase/purchaseOrderAmendmentAPI";

const PurchaseOrderAmendmentList = ({ onAdd, onEdit }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await purchaseOrderAmendmentAPI.getAll(orgId, branch);
      setData(list);
    } catch (error) {
      console.error("Failed to load PO amendments:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, branch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    { key: "sno", label: "#", type: "text" },
    { key: "amendmentNo", label: "Amendment No", type: "text", accessor: (row) => row.amendmentNo || "" },
    { key: "amendmentDate", label: "Amendment Date", type: "text", accessor: (row) => row.amendmentDate || "" },
    { key: "poNo", label: "PO No", type: "text", accessor: (row) => row.poNo || "" },
    { key: "partyName", label: "Party Name", type: "text", accessor: (row) => row.partyName || "" },
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

  const searchFields = ["amendmentNo", "poNo", "partyName"];

  return (
    <CommonListViewTable
      title="Purchase Order Amendment"
      subtitle="Manage purchase order amendments and revisions"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onAddNew={onAdd}
      onEdit={onEdit}
      emptyMessage="No PO amendments found"
    />
  );
};

export default PurchaseOrderAmendmentList;

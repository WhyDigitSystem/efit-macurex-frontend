import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import stockOrderAPI from "../../../api/Production/stockOrderAPI";
import { toast } from "../../../utils/toast";

const StockOrderList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stockOrderAPI.getByOrgId(ORG_ID, BRANCH_ID);
      const sorted = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(sorted);
    } catch (error) {
      console.error("Failed to fetch Stock Order records:", error);
      setRecords([]);
      toast.error("Failed to fetch Stock Orders");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Stock Order No",
      accessor: (row) => row.docId || row.stockOrderNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "financialYear",
      label: "Financial Year",
      accessor: (row) => row.financialYear || "",
      type: "text",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: (row) => row.totalAmount ?? 0,
      type: "text",
    },
    {
      key: "active",
      label: "Active",
      accessor: (row) => (row.active === false ? "No" : "Yes"),
      type: "text",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "120px",
    },
  ];

  const searchFields = ["docId", "financialYear", "totalAmount", "active"];

  return (
    <CommonListViewTable
      title="Stock Order"
      data={records}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Stock Orders found"
      loadingMessage="Loading Stock Orders..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default StockOrderList;

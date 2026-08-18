import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import supplierResponseAPI from "../../../api/quality/supplierResponseAPI";
import { toast } from "../../../utils/toast";

const SupplierResponseList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supplierResponseAPI.getSupplierResponseByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch supplier responses:", error);
      setRecords([]);
      toast.error("Failed to fetch Supplier Response Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: (row) => row.docNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "complaintId",
      label: "Complaint No",
      accessor: (row) =>
        typeof row.complaintId === "object"
          ? row.complaintId.docNo || row.complaintId.id
          : row.complaintNo || row.complaintId,
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.docDate || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "productNo",
      label: "Product No",
      accessor: (row) => row.productNo || "",
      type: "text",
    },
    {
      key: "productName",
      label: "Product Name",
      accessor: (row) => row.productName || "",
      type: "text",
    },
    {
      key: "supplierId",
      label: "Supplier No",
      accessor: (row) =>
        typeof row.supplierId === "object"
          ? row.supplierId.customerCode ||
            row.supplierId.customerName ||
            row.supplierId.id
          : row.supplierNo || row.supplierId,
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) => row.supplierName || "",
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

  const searchFields = [
    "docNo",
    "complaintId",
    "docDate",
    "productNo",
    "productName",
    "supplierId",
    "supplierName",
  ];

  return (
    <CommonListViewTable
      title="Supplier Response Entry"
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
      emptyMessage="No Supplier Response Entries found"
      loadingMessage="Loading Supplier Response Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default SupplierResponseList;
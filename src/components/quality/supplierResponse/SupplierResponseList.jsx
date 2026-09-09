import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import supplierResponseAPI from "../../../api/quality/supplierResponseAPI";
import { toast } from "../../../utils/toast";

const SupplierResponseList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supplierResponseAPI.getSupplierResponseByOrgId(ORG_ID);
      const sorted = [...(data || [])].sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );
      setRecords(sorted);
    } catch (error) {
      console.error("Failed to fetch supplier responses:", error);
      setRecords([]);
      toast.error("Failed to fetch Supplier Response Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "complaintNo",
      label: "Complaint No",
      accessor: (row) => row.complaintNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "complaintDate",
      label: "Complaint Date",
      accessor: (row) => row.complaintDate || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "productNo",
      label: "Part No",
      accessor: (row) => row.productNo || "",
      type: "text",
    },
    {
      key: "productName",
      label: "Part Name",
      accessor: (row) => row.productName || "",
      type: "text",
    },
    {
      key: "supplierNo",
      label: "Supplier No",
      accessor: (row) => row.supplierNo || "",
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) => row.supplierName || "",
      type: "text",
    },
    {
      key: "financialYear",
      label: "Financial Year",
      accessor: (row) => row.financialYear || "",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row.active === true || row.active === "Active" ? "Active" : "Inactive",
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
      width: "120px",
    },
  ];

  const searchFields = [
    "complaintNo",
    "complaintDate",
    "productNo",
    "productName",
    "supplierNo",
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

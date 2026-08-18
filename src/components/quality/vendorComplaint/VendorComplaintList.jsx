import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import vendorComplaintAPI from "../../../api/quality/vendorComplaintAPI";
import { toast } from "../../../utils/toast";

const VendorComplaintList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorComplaintAPI.getVendorComplaintByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch vendor complaints:", error);
      setRecords([]);
      toast.error("Failed to fetch Vendor Complaint Entries");
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
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.docDate || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "fgItem",
      label: "FG Item",
      accessor: (row) =>
        typeof row.fgItem === "object"
          ? row.fgItem.itemCode || row.fgItem.itemName || row.fgItem.id
          : row.fgItem || "",
      type: "text",
    },
    {
      key: "fgName",
      label: "FG Name",
      accessor: (row) => row.fgName || "",
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
    "docDate",
    "fgItem",
    "fgName",
    "supplierId",
    "supplierName",
  ];

  return (
    <CommonListViewTable
      title="Vendor Complaint Entry"
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
      emptyMessage="No Vendor Complaint Entries found"
      loadingMessage="Loading Vendor Complaint Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default VendorComplaintList;
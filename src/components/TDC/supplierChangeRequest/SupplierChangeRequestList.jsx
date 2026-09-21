import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import supplierChangeRequestAPI from "../../../api/TDC/supplierChangeRequestAPI";
import { toast } from "../../../utils/toast";

const SupplierChangeRequestList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadRecords = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setRecords([]);
      return;
    }

    try {
      setLoading(true);

      const data = await supplierChangeRequestAPI.getByOrgIdAndBranch({
        branch: BRANCH_ID,
        orgId: ORG_ID,
      });

      data.sort((a, b) => (b.id || 0) - (a.id || 0));

      setRecords(data);
    } catch (error) {
      console.error("Failed to load supplier change requests:", error);
      setRecords([]);
      toast.error("Failed to fetch Supplier Change Requests");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* ---------------- Accessors ---------------- */

  const getPlantLabel = (row) =>
    row?.branch?.branchName || row?.branch?.branchCode || row?.branch?.id || "";

  const getVendorLabel = (row) =>
    row?.vendorCode?.customerName ||
    row?.vendorCode?.vendorCode ||
    row?.vendorCode?.id ||
    "";

  const getEmployeeName = (obj) =>
    (obj && typeof obj === "object" ? obj.employeeName || obj.employeeId : obj) ||
    "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "docId",
      label: "SCR No",
      accessor: (row) => row?.docId || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Date",
      accessor: (row) => row?.docDate || "",
      type: "text",
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) => getPlantLabel(row),
      type: "text",
    },
    {
      key: "vendorCode",
      label: "Vendor",
      accessor: (row) => getVendorLabel(row),
      type: "text",
    },
    {
      key: "partNo",
      label: "Part Number",
      accessor: (row) => row?.partNo || "",
      type: "text",
    },
    {
      key: "partDescription",
      label: "Part Description",
      accessor: (row) => row?.partDescription || "",
      type: "text",
    },
    {
      key: "buyerName",
      label: "Buyer Name",
      accessor: (row) => getEmployeeName(row?.buyerName),
      type: "text",
    },
    {
      key: "sourceTriggeredBy",
      label: "Source/Process Triggered By",
      accessor: (row) => getEmployeeName(row?.sourceTriggeredBy),
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) =>
        row?.active === true || row?.active === "Active"
          ? "Active"
          : "Inactive",
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

  /* ---------------- Search / Filter ---------------- */

  const searchFields = [
    "docId",
    "docDate",
    "branch.branchName",
    "vendorCode.customerName",
    "vendorCode.vendorCode",
    "partNo",
    "partDescription",
    "buyerName.employeeName",
    "sourceTriggeredBy.employeeName",
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
      title="Supplier Change Request"
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
      emptyMessage="No Supplier Change Requests found"
      loadingMessage="Loading Supplier Change Requests..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SupplierChangeRequests"
    />
  );
};

export default SupplierChangeRequestList;
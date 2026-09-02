import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import inwardInspectionAPI from "../../../api/quality/inwardInspectionAPI";
import { toast } from "../../../utils/toast";

const InwardInspectionList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inwardInspectionAPI.getInwardInspectionByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      console.log("Inward Inspection List Response:", response);

      // The response should be an array of records
      const data = Array.isArray(response) ? response : [];
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load inward inspections:", error);
      setRecords([]);
      toast.error("Failed to fetch Inward Inspections");
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
      accessor: (row) => row.docId || row.docNo || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.docDate || "",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) => {
        if (row.branch) {
          return row.branch.branchName || row.branch.id;
        }
        if (row.plantId) {
          return typeof row.plantId === "object"
            ? row.plantId.branchName || row.plantId.id
            : row.plantId;
        }
        return "";
      },
      type: "text",
    },
    {
      key: "inwardType",
      label: "Inward Type",
      accessor: (row) => row.inwardType || "",
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier Code",
      accessor: (row) => {
        if (row.supplierCode) {
          return typeof row.supplierCode === "object"
            ? row.supplierCode.supplierCode || row.supplierCode.id
            : row.supplierCode;
        }
        return "";
      },
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) => {
        if (row.supplierCode) {
          return typeof row.supplierCode === "object"
            ? row.supplierCode.supplierName || row.supplierCode.customerName || row.supplierCode.name || row.supplierCode.id
            : row.supplierCode;
        }
        if (row.supplierName) {
          return typeof row.supplierName === "object"
            ? row.supplierName.customerName || row.supplierName.name || row.supplierName.id
            : row.supplierName;
        }
        return "";
      },
      type: "text",
    },
    {
      key: "mrnNo",
      label: "MRN/SC GRN No",
      accessor: (row) => row.mrinGrnNo || row.mrnNo || row.mrnScGrnNo || "",
      type: "text",
    },
    {
      key: "active",
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
    "docId",
    "docNo",
    "docDate",
    "inwardType",
    "mrinGrnNo",
    "mrnNo",
    "mrnScGrnNo",
    "supplierCode.supplierCode",
    "supplierCode.supplierName",
    "branch.branchName",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "approved",
      label: "Approved",
      field: "approved",
      filterValue: true,
      activeValue: true,
    },
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
      title="Inward Inspection"
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
      emptyMessage="No Inward Inspections found"
      loadingMessage="Loading Inward Inspections..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="InwardInspections"
    />
  );
};

export default InwardInspectionList;
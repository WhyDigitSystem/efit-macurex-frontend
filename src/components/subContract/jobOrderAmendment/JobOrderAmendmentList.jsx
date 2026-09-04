import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import jobOrderAmendmentAPI from "../../../api/SubContract/jobOrderAmendmentAPI";
import { toast } from "../../../utils/toast";

/* ================================================================
   FIELD EXTRACTION HELPERS

   The list endpoint (getJobOrderAmendmentByOrgIdAndBranch) wasn't
   fully documented in the swagger you shared — its example response
   just showed an empty array. Real rows may come back with "customer"
   as a nested object ({ id, customerName, ... }) the same way
   ToolMasterVO nests branch/department/etc., or as a flat id.
   These helpers handle either shape so the table doesn't break.
================================================================ */

const getEntityId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return String(value.id ?? value.customerId ?? "");
  }
  return String(value);
};

const getEntityName = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return value.customerName || value.name || "";
  }
  return "";
};

const normalizeActive = (active) => {
  if (typeof active === "boolean") {
    return active ? "Active" : "Inactive";
  }
  const asString = String(active || "").toLowerCase();
  return asString === "active" || asString === "true" ? "Active" : "Inactive";
};

const mapRecordForList = (record) => ({
  ...record,

  id: record.id,

  docId: record.docId || "",

  docDate: record.docDate || record.createdOn || "",

  partyId: getEntityId(record.customer ?? record.partyId),

  partyName: record.partyName || getEntityName(record.customer) || "",

  jobOrderNo: record.jobOrderNo || "",

  jobOrderDate: record.jobOrderDate || "",

  revisionNo: record.revisionNo ?? "",

  active: normalizeActive(record.active),
});

const JobOrderAmendmentList = ({
  onAddNew,
  onEdit,
  refreshTrigger,
  onBack,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const data = await jobOrderAmendmentAPI.getJobOrderAmendmentByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const mapped = (Array.isArray(data) ? data : [])
        .map(mapRecordForList)
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      setRecords(mapped);
    } catch (error) {
      console.error("Failed to load job order amendments:", error);
      setRecords([]);
      toast.error("Failed to fetch Job Order Amendments");
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
      label: "Doc Id",
      accessor: "docId",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "text",
    },
    {
      key: "partyId",
      label: "Party Id",
      accessor: "partyId",
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "jobOrderNo",
      label: "Job Order No",
      accessor: "jobOrderNo",
      type: "text",
    },
    {
      key: "jobOrderDate",
      label: "Job Order Date",
      accessor: "jobOrderDate",
      type: "text",
    },
    {
      key: "revisionNo",
      label: "Revision No",
      accessor: "revisionNo",
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
    "docDate",
    "partyId",
    "partyName",
    "jobOrderNo",
    "jobOrderDate",
    "revisionNo",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
    },
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
      title="Job Order Amendment"
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
      emptyMessage="No Job Order Amendments found"
      loadingMessage="Loading Job Order Amendments..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="JobOrderAmendments"
    />
  );
};

export default JobOrderAmendmentList;

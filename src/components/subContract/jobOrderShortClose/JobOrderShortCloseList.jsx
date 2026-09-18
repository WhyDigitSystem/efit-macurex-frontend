import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import jobOrderShortCloseAPI from "../../../api/jobOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const JobOrderShortCloseList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  /* ==========================================================================
     HELPER
  ========================================================================== */

  const getValue = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string" || typeof value === "number") {
      return value;
    }

    return (
      value.name ||
      value.customerName ||
      value.itemName ||
      value.branchName ||
      value.code ||
      value.customerCode ||
      value.id ||
      fallback
    );
  };

  /* ==========================================================================
     NORMALIZE BACKEND RESPONSE

     This prevents CommonListViewTable from receiving objects such as:

     customer: {
       id: 1000000001,
       customerName: "ABC"
     }

     Instead it receives:

     customerName: "ABC"
  ========================================================================== */

  const normalizeRecord = (record) => {
    const customer = record?.customer || {};

    return {
      ...record,

      /*
       * Keep database id untouched.
       * This is IMPORTANT because Edit needs this id.
       */
      id: record?.id,

      shortCloseNo:
        record?.shortCloseNo || record?.docId || record?.shortCloseDocId || "",

      date: record?.date || record?.docDate || "",

      customerId:
        record?.customerId || customer?.id || customer?.customerId || "",

      customerName:
        record?.customerName || customer?.customerName || customer?.name || "",

      jobOrderNo: record?.jobOrderNo || "",

      grnNo: record?.grnNo || record?.grnNumber || "",

      referenceForSC: record?.referenceForSC || record?.referenceForSc || "",

      active: record?.active !== false,
    };
  };

  /* ==========================================================================
     LOAD RECORDS
  ========================================================================== */

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      if (!ORG_ID || !BRANCH_ID) {
        console.warn("Missing orgId or branchId", {
          ORG_ID,
          BRANCH_ID,
        });

        setRecords([]);
        return;
      }

      const data = await jobOrderShortCloseAPI.getJobOrderShortCloseByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      console.log("Job Order Short Close API Response:", data);

      const normalizedData = (Array.isArray(data) ? data : []).map(
        normalizeRecord,
      );

      /*
       * Latest records first.
       */
      normalizedData.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0));

      console.log("Job Order Short Close List:", normalizedData);

      setRecords(normalizedData);
    } catch (error) {
      console.error("Failed to load job order short closes:", error);

      setRecords([]);

      toast.error("Failed to fetch Job Order Short Closes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  /* ==========================================================================
     INITIAL LOAD / REFRESH
  ========================================================================== */

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* ==========================================================================
     COLUMNS
  ========================================================================== */

  const columns = [
    {
      key: "shortCloseNo",
      label: "Short Close No",
      accessor: "shortCloseNo",
      type: "text",
    },

    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
    },

    {
      key: "customerId",
      label: "Customer Id",
      accessor: "customerId",
      type: "text",
    },

    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },

    {
      key: "jobOrderNo",
      label: "Job Order No",
      accessor: "jobOrderNo",
      type: "text",
    },

    {
      key: "grnNo",
      label: "GRN No",
      accessor: "grnNo",
      type: "text",
    },

    {
      key: "referenceForSC",
      label: "Reference For SC",
      accessor: "referenceForSC",
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

  /* ==========================================================================
     SEARCH
  ========================================================================== */

  const searchFields = [
    "shortCloseNo",
    "date",
    "customerId",
    "customerName",
    "jobOrderNo",
    "grnNo",
    "referenceForSC",
  ];

  /* ==========================================================================
     FILTER
  ========================================================================== */

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

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <CommonListViewTable
      title="Job Order Short Close"
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
      emptyMessage="No Job Order Short Closes found"
      loadingMessage="Loading Job Order Short Closes..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="JobOrderShortCloses"
    />
  );
};

export default JobOrderShortCloseList;

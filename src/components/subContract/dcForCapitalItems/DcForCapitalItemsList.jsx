import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import dcForCapitalItemsAPI from "../../../api/dcForCapitalItemsAPI";
import { toast } from "../../../utils/toast";

const DcForCapitalItemsList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // ========================================================================
  // LOCAL STORAGE
  // ========================================================================

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  // ========================================================================
  // NORMALIZE API RESPONSE
  // Backend response contains nested objects.
  // Convert them into simple values for CommonListViewTable.
  // ========================================================================

  const normalizeRecord = (item) => {
    return {
      ...item,

      // Header
      dcCiNo: item?.docId || "",
      scDcDate: item?.docDate || "",

      // Branch / Plant
      plantName: item?.branch?.branchName || "",
      plantCode: item?.branch?.branchCode || "",
      plantId: item?.branch?.id || "",

      // Belongs To
      belongsTo: item?.belongsTo || "",

      // Department
      department: item?.department?.departmentName || "",
      departmentCode: item?.department?.departmentCode || "",
      departmentId: item?.department?.id || "",

      // Vendor
      vendorId: item?.vendor?.customerCode || "",
      vendorName: item?.vendor?.customerName || "",
      vendorDbId: item?.vendor?.id || "",

      // Customer / Party Location
      partyLocation: item?.customerLocation?.locationName || "",
      partyLocationId: item?.customerLocation?.id || "",

      // Other header fields
      indentNo: item?.indentNo || "",
      transportName: item?.transportName || "",
      vehicleNo: item?.vehicleNo || "",
      dcType: item?.dcType || "",
      approvalByStores: item?.approvalByStores || "",

      // Employees
      preparedBy: item?.preparedBy?.employeeName || "",
      preparedById: item?.preparedBy?.employeeId || "",

      approvedBy: item?.approvedBy?.employeeName || "",
      approvedById: item?.approvedBy?.employeeId || "",

      // Status
      active: item?.active === true ? "Active" : "Inactive",

      // Keep original details for edit
      details: Array.isArray(item?.details)
        ? item.details.map((detail) => ({
            ...detail,

            outgoingItemCode: detail?.outgoingItem?.itemCode || "",

            outgoingItemDescription:
              detail?.outgoingItem?.itemDescription || "",

            outgoingItemId: detail?.outgoingItem?.id || "",

            unit:
              detail?.unit?.unitId || detail?.outgoingItem?.unit?.unitId || "",

            unitId: detail?.unit?.id || detail?.outgoingItem?.unit?.id || "",

            fromLocation: detail?.fromLocation?.locationName || "",

            fromLocationId: detail?.fromLocation?.id || "",

            stock: detail?.stock ?? 0,
            availableStock: detail?.availableStock ?? 0,
            issueQty: detail?.issueQty ?? 0,
            unitRate: detail?.unitRate ?? 0,
            amount: detail?.amount ?? 0,
            remarks: detail?.remarks || "",
          }))
        : [],
    };
  };

  // ========================================================================
  // LOAD RECORDS
  // ========================================================================

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      console.log("========================================");
      console.log("Loading DC For Capital Items");
      console.log("ORG_ID:", ORG_ID);
      console.log("BRANCH_ID:", BRANCH_ID);
      console.log("========================================");

      const data = await dcForCapitalItemsAPI.getDcForCapitalItemsByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      console.log("Raw DC For Capital Items Response:", data);

      const recordsList = Array.isArray(data) ? data.map(normalizeRecord) : [];

      // Latest records first
      recordsList.sort((a, b) => {
        return (Number(b?.id) || 0) - (Number(a?.id) || 0);
      });

      console.log("Normalized DC For Capital Items:", recordsList);

      setRecords(recordsList);
    } catch (error) {
      console.error("Failed to load DC for capital items:", error);

      setRecords([]);

      toast.error("Failed to fetch DC For Capital Items");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  // ========================================================================
  // INITIAL LOAD + REFRESH AFTER SAVE
  // ========================================================================

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  // ========================================================================
  // TABLE COLUMNS
  // ========================================================================

  const columns = [
    {
      key: "dcCiNo",
      label: "DC CI No",
      accessor: "dcCiNo",
      type: "text",
    },

    {
      key: "scDcDate",
      label: "SC DC Date",
      accessor: "scDcDate",
      type: "text",
    },

    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },

    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },

    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },

    {
      key: "vendorId",
      label: "Vendor Id",
      accessor: "vendorId",
      type: "text",
    },

    {
      key: "vendorName",
      label: "Vendor Name",
      accessor: "vendorName",
      type: "text",
    },

    {
      key: "partyLocation",
      label: "Party Location",
      accessor: "partyLocation",
      type: "text",
    },

    {
      key: "indentNo",
      label: "Indent No",
      accessor: "indentNo",
      type: "text",
    },

    {
      key: "dcType",
      label: "D.C Type",
      accessor: "dcType",
      type: "text",
    },

    {
      key: "approvalByStores",
      label: "Stores Approval",
      accessor: "approvalByStores",
      type: "text",
    },

    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
      type: "text",
    },

    {
      key: "approvedBy",
      label: "Approved By",
      accessor: "approvedBy",
      type: "text",
    },

    {
      key: "transportName",
      label: "Transport Name",
      accessor: "transportName",
      type: "text",
    },

    {
      key: "vehicleNo",
      label: "Vehicle No",
      accessor: "vehicleNo",
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

  // ========================================================================
  // SEARCH FIELDS
  // ========================================================================

  const searchFields = [
    "dcCiNo",
    "scDcDate",
    "plantName",
    "belongsTo",
    "department",
    "vendorId",
    "vendorName",
    "partyLocation",
    "indentNo",
    "dcType",
    "approvalByStores",
    "preparedBy",
    "approvedBy",
    "transportName",
    "vehicleNo",
  ];

  // ========================================================================
  // FILTERS
  // ========================================================================

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

  // ========================================================================
  // UI
  // ========================================================================

  return (
    <CommonListViewTable
      title="DC For Capital Items"
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
      emptyMessage="No DC For Capital Items found"
      loadingMessage="Loading DC For Capital Items..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="DcForCapitalItems"
    />
  );
};

export default DcForCapitalItemsList;

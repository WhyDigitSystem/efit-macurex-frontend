import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import dcForCapitalItemsAPI from "../../../api/dcForCapitalItemsAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------
 * Convert a raw API record (nested objects) into the flat shape that
 * DcForCapitalItemsForm expects.
 * ---------------------------------------------------------------- */
const normalizeRecord = (item) => {
  if (!item) return null;

  return {
    ...item,

    /* ---------------- Header ---------------- */
    plantId: item?.branch?.id ?? "",
    dcCiNo: item?.docId || "",
    scDcDate: item?.docDate || "",

    belongsTo: item?.belongsTo || "",

    departmentId: item?.department?.id ?? "",
    departmentName: item?.department?.departmentName || "",
    departmentCode: item?.department?.departmentCode || "",

    vendorId: item?.vendor?.id ?? "",
    vendorCode: item?.vendor?.customerCode || "",
    vendorName: item?.vendor?.customerName || "",

    partyLocation: item?.customerLocation?.id ?? "",
    partyLocationName: item?.customerLocation?.locationName || "",

    indentNo: item?.indentNo || "",
    transportName: item?.transportName || "",
    vehicleNo: item?.vehicleNo || "",
    dcType: item?.dcType || "",
    approvalByStores: item?.approvalByStores || "",
    remarks: item?.remarks || "",
    cancelRemarks: item?.cancelRemarks || "",

    preparedBy: item?.preparedBy?.employeeId ?? "",
    preparedByName: item?.preparedBy?.employeeName || "",

    approvedBy: item?.approvedBy?.employeeId ?? "",
    approvedByName: item?.approvedBy?.employeeName || "",

    active:
      item?.active === true ||
      item?.active === "Active" ||
      item?.active === undefined,

    /* ---------------- Details ---------------- */
    details: Array.isArray(item?.details)
      ? item.details.map((d) => {
        const outgoing = d?.outgoingItem || {};
        const unitObj = d?.unit || outgoing?.unit || {};

        return {
          id: d?.id,
          // select value → numeric item id
          outgoingItemCode: outgoing?.id ?? "",
          outgoingItemDescription: outgoing?.itemDescription || "",
          outgoingItemCodeName: outgoing?.itemCode || "",
          // display string
          unit: unitObj?.unitId || "",
          // numeric id for the payload / select matching
          unitId: unitObj?.id ?? "",
          fromLocation: d?.fromLocation?.id ?? "",
          fromLocationName: d?.fromLocation?.locationName || "",
          stock: d?.stock ?? 0,
          availableStock: d?.availableStock ?? 0,
          issueQty: d?.issueQty ?? 0,
          unitRate: d?.unitRate ?? 0,
          amount: d?.amount ?? 0,
          remarks: d?.remarks || "",
        };
      })
      : [],
  };
};

/* ------------------------------------------------------------------ */

const DcForCapitalItemsList = ({
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
    try {
      setLoading(true);

      const data = await dcForCapitalItemsAPI.getDcForCapitalItemsByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const list = Array.isArray(data) ? data : [];

      const normalized = list
        .map(normalizeRecord)
        .filter(Boolean)
        .sort((a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0));

      setRecords(normalized);
    } catch (error) {
      console.error("Failed to load DC for capital items:", error);
      setRecords([]);
      toast.error("Failed to fetch DC For Capital Items");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* ---------------- Table columns ---------------- */
  const columns = [
    { key: "dcCiNo", label: "DC CI No", accessor: "dcCiNo", type: "text" },
    {
      key: "scDcDate",
      label: "SC DC Date",
      accessor: "scDcDate",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: (r) => r?.branch?.branchName || "",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "departmentName",
      label: "Department",
      accessor: "departmentName",
      type: "text",
    },
    {
      key: "vendorCode",
      label: "Vendor Id",
      accessor: "vendorCode",
      type: "text",
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      accessor: "vendorName",
      type: "text",
    },
    {
      key: "partyLocationName",
      label: "Party Location",
      accessor: "partyLocationName",
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
      key: "preparedByName",
      label: "Prepared By",
      accessor: "preparedByName",
      type: "text",
    },
    {
      key: "approvedByName",
      label: "Approved By",
      accessor: "approvedByName",
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
        true: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        false: {
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
    "dcCiNo",
    "scDcDate",
    "belongsTo",
    "departmentName",
    "vendorCode",
    "vendorName",
    "partyLocationName",
    "indentNo",
    "dcType",
    "approvalByStores",
    "preparedByName",
    "approvedByName",
    "transportName",
    "vehicleNo",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    { value: "active", label: "Active", field: "active", filterValue: true },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
    },
  ];

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
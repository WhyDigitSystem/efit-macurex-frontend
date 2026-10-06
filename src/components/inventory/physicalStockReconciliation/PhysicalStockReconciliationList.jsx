// src/components/Inventory/PhysicalStockReconciliation/PhysicalStockReconciliationList.jsx

import { useCallback, useEffect, useState } from "react";
import physicalStockReconciliationAPI from "../../../api/Inventory/physicalStockReconciliationAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const isObj = (v) => v !== null && typeof v === "object";

const formatAmount = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

/* The API may return the array directly or inside paramObjectsMap */
const extractList = (response) => {
  if (Array.isArray(response)) return response;

  const map = response?.paramObjectsMap || response?.data?.paramObjectsMap;

  const list =
    map?.physicalStockReConcilationVO ??
    Object.values(map || {}).find((v) => Array.isArray(v));

  return Array.isArray(list) ? list : [];
};

const approvalClasses = {
  Approved:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const PhysicalStockReconciliationList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [reconciliationData, setReconciliationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadReconciliations = useCallback(async () => {
    try {
      setLoading(true);

      if (!ORG_ID || !BRANCH_ID) {
        setReconciliationData([]);
        toast.error("Organization or Branch is missing");
        return;
      }

      const response =
        await physicalStockReconciliationAPI.getReconciliationByOrgId(
          ORG_ID,
          BRANCH_ID,
        );

      const list = extractList(response);

      const transformed = list.map((item) => {
        const details = Array.isArray(
          item.physicalStockReConcilationDetailsResponseDTO,
        )
          ? item.physicalStockReConcilationDetailsResponseDTO
          : [];

        const totalAmount = details.reduce(
          (sum, d) => sum + (Number(d.amount) || 0),
          0,
        );

        const itemCodes = details
          .map((d) => (isObj(d.item) ? d.item.itemCode : d.item))
          .filter(Boolean)
          .join(", ");

        return {
          /* keep everything untouched so the edit form gets the real objects */
          ...item,

          /* display-only fields */
          plantName: isObj(item.branch)
            ? item.branch.branchName || item.branch.branchCode || ""
            : String(item.branch ?? ""),

          locationTypeName: isObj(item.locationType)
            ? item.locationType.description || item.locationType.code || ""
            : String(item.locationType ?? ""),

          locationName: isObj(item.location)
            ? item.location.locationName || ""
            : String(item.location ?? ""),

          preparedByName: isObj(item.preparedBy)
            ? item.preparedBy.employeeName || item.preparedBy.employeeCode || ""
            : String(item.preparedBy ?? ""),

          itemCount: details.length,

          itemCodes,

          totalAmount: formatAmount(totalAmount),

          approvalStatus: isObj(item.approvedByPM)
            ? item.approvedByPM.employeeName || ""
            : item.approvedByPM || "Pending",

          timeShort: String(item.time || "").slice(0, 5),
        };
      });

      transformed.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setReconciliationData(transformed);
    } catch (error) {
      console.error("Failed to load physical stock reconciliations:", error);
      setReconciliationData([]);
      toast.error("Failed to fetch physical stock reconciliations");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadReconciliations();
  }, [loadReconciliations, refreshTrigger]);

  /* ---------------------------------------------------------------------- */
  /* Columns                                                                 */
  /* ---------------------------------------------------------------------- */

  const columns = [
    {
      key: "docId",
      label: "Doc No.",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc. Date",
      accessor: "docDate",
      type: "date",
    },
    {
      key: "timeShort",
      label: "Time",
      accessor: "timeShort",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },
    {
      key: "locationTypeName",
      label: "Location Type",
      accessor: "locationTypeName",
      type: "text",
    },
    {
      key: "locationName",
      label: "Location",
      accessor: "locationName",
      type: "text",
    },
    {
      key: "refNo",
      label: "Ref. No",
      accessor: "refNo",
      type: "text",
    },
    {
      key: "refDate",
      label: "Ref. Date",
      accessor: "refDate",
      type: "date",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "itemCodes",
      label: "Items",
      accessor: "itemCodes",
      type: "text",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "text",
      align: "right",
    },
    {
      key: "preparedByName",
      label: "Prepared By",
      accessor: "preparedByName",
      type: "text",
      render: (value) => (
        <span className="text-xs text-gray-900 dark:text-white">
          {value || "-"}
        </span>
      ),
    },
    {
      key: "approvalStatus",
      label: "Approved By PM",
      accessor: "approvalStatus",
      type: "text",
      render: (value) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
            approvalClasses[value] ||
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "narration",
      label: "Narration",
      accessor: "narration",
      type: "text",
    },
    {
      key: "createdBy",
      label: "Created By",
      accessor: "createdBy",
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
    "plantName",
    "locationTypeName",
    "locationName",
    "refNo",
    "belongsTo",
    "itemCodes",
    "preparedByName",
    "approvalStatus",
    "narration",
    "createdBy",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "pending",
      label: "Pending",
      field: "approvalStatus",
      filterValue: "Pending",
      activeValue: "Pending",
    },
    {
      value: "approved",
      label: "Approved",
      field: "approvalStatus",
      filterValue: "Approved",
      activeValue: "Approved",
    },
    {
      value: "rejected",
      label: "Rejected",
      field: "approvalStatus",
      filterValue: "Rejected",
      activeValue: "Rejected",
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
      activeValue: "Inactive",
    },
  ];

  return (
    <CommonListViewTable
      title="Physical Stock Re-Conciliation"
      data={reconciliationData}
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
      emptyMessage="No Physical Stock Reconciliations found"
      loadingMessage="Loading Physical Stock Reconciliations..."
      enableRefresh={true}
      onRefresh={loadReconciliations}
      enableExport={true}
      exportFileName="PhysicalStockReconciliations"
    />
  );
};

export default PhysicalStockReconciliationList;

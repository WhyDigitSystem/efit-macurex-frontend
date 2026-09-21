import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import processValidationEntryAPI from "../../../api/Production/processValidationEntryAPI";
import { toast } from "../../../utils/toast";

const ProcessValidationEntryList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [entryData, setEntryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;

  const loadProcessValidationEntries = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setEntryData([]);
      return;
    }

    try {
      setLoading(true);

      const response =
        await processValidationEntryAPI.getByOrgIdAndBranch({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setEntryData(sortedData);
    } catch (error) {
      console.error("Failed to load process validation entries:", error);
      setEntryData([]);
      toast.error("Failed to fetch process validation entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadProcessValidationEntries();
  }, [loadProcessValidationEntries, refreshTrigger]);

  /* ---------------- Accessors ---------------- */

  const getPlantLabel = (row) =>
    row?.branch?.branchName ||
    row?.branch?.branchCode ||
    row?.branch?.id ||
    "";

  const getItemLabel = (row) =>
    row?.item?.itemCode || row?.item?.id || "";

  const getPartyLabel = (row) =>
    row?.customer?.customerName || row?.customer?.id || "";

  /* ✅ Fixed: fall back through readable fields before the raw id */
  const getProcessSheetLabel = (row) => {
    const ps = row?.processSheetNo;
    if (!ps) return "";

    return (
      ps.docId ||                     // preferred display id
      ps.processSheetNo ||            // alt field name
      ps.planNo ||                    // another possible backend key
      ps.bomId ||                     // e.g. "BOM-001"
      ps.itemDescription ||           // e.g. "Component Routing for Finished Product"
      ps.fgSfgItemCode?.itemCode ||   // e.g. "123"
      String(ps.id)                   // last resort: numeric id
    );
  };

  const getControlPlanLabel = (row) =>
    row?.controlPlan?.planNo || row?.controlPlan?.id || "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "docId",
      label: "Doc No.",
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
      label: "Plant Id",
      accessor: (row) => getPlantLabel(row),
      type: "text",
    },
    {
      key: "item",
      label: "Item Code",
      accessor: (row) => getItemLabel(row),
      type: "text",
    },
    {
      key: "customer",
      label: "Party Name",
      accessor: (row) => getPartyLabel(row),
      type: "text",
    },
    {
      key: "processSheetNo",
      label: "Process Sheet No",
      accessor: (row) => getProcessSheetLabel(row),
      type: "text",
    },
    {
      key: "controlPlan",
      label: "Control Plan",
      accessor: (row) => getControlPlanLabel(row),
      type: "text",
    },
    {
      key: "validationReason",
      label: "Validation Reason",
      accessor: (row) => row?.validationReason || "",
      type: "text",
    },
    {
      key: "recommendedForProduction",
      label: "Recommended For Production",
      accessor: (row) => row?.recommendedForProduction || "",
      type: "badge",
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

  const searchFields = [
    "docId",
    "item.itemCode",
    "customer.customerName",
    "validationReason",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Process Validation Entry"
        data={entryData}
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
        emptyMessage="No Process Validation Entries found"
        loadingMessage="Loading Process Validation Entries..."
        enableRefresh={true}
        onRefresh={loadProcessValidationEntries}
        enableExport={true}
        exportFileName="ProcessValidationEntries"
      />
    </div>
  );
};

export default ProcessValidationEntryList;
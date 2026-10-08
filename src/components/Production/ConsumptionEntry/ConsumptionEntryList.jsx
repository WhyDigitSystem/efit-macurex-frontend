import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import consumptionEntryAPI from "../../../api/Production/consumptionEntryAPI";

const formatDate = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) {
    const [y, m, d] = value;
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }
  const s = String(value).slice(0, 10);
  const [y, m, d] = s.split("-");
  return y && m && d ? `${d}/${m}/${y}` : s;
};

const ConsumptionEntryList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [consumptionData, setConsumptionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  // Logged-in branch (see getCurrentBranch in consumptionEntryAPI)
  const BRANCH_ID = consumptionEntryAPI.getCurrentBranch().id;

  const loadConsumptionEntries = useCallback(async () => {
    try {
      setLoading(true);

      // No branch stored locally -> fall back to the first branch of the org
      let branchId = BRANCH_ID;
      if (!branchId) {
        const branches = await consumptionEntryAPI.getBranches(ORG_ID);
        branchId = branches[0]?.id || 0;
      }

      const response = await consumptionEntryAPI.getConsumptionEntryByOrgId(
        branchId,
        ORG_ID,
      );

      // Flatten nested objects so search / columns are simple
      const rows = (response || [])
        .map((r) => ({
          ...r,
          // backend returns "Active"/"Inactive" strings
          active: r.active === true || r.active === "Active",
          plantName: r.branch?.branchName || r.branch?.branchCode || "",
          locationName: r.location?.locationName || "",
          entryTypeName: r.entryType?.listDescription || "",
          docDateText: formatDate(r.docDate),
        }))
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      setConsumptionData(rows);
    } catch (error) {
      console.error("Failed to load consumption entries:", error);
      setConsumptionData([]);
      toast.error("Failed to fetch consumption entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadConsumptionEntries();
  }, [loadConsumptionEntries, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Doc Id",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDateText",
      type: "text",
      noWrap: true,
    },
    { key: "plant", label: "Plant", accessor: "plantName", type: "text" },
    { key: "type", label: "Type", accessor: "type", type: "text" },
    {
      key: "consumption",
      label: "Consumption ?",
      accessor: "consumption",
      type: "text",
    },
    {
      key: "location",
      label: "Location",
      accessor: "locationName",
      type: "text",
    },
    {
      key: "entryType",
      label: "Type (List)",
      accessor: "entryTypeName",
      type: "text",
    },
    { key: "active", label: "Status", accessor: "active", type: "status" },
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
    "locationName",
    "entryTypeName",
    "consumption",
    "type",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Consumption Entry"
        data={consumptionData}
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
        emptyMessage="No Consumption Entries found"
        loadingMessage="Loading Consumption Entries..."
        enableRefresh={true}
        onRefresh={loadConsumptionEntries}
        enableExport={true}
        exportFileName="ConsumptionEntries"
      />
    </div>
  );
};

export default ConsumptionEntryList;

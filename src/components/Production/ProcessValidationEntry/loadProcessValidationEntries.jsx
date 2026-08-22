import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ProcessValidationEntryList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [entryData, setEntryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadProcessValidationEntries = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await processValidationEntryAPI.getProcessValidationEntryByOrgId(
          ORG_ID,
        );

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
  }, [ORG_ID]);

  useEffect(() => {
    loadProcessValidationEntries();
  }, [loadProcessValidationEntries, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No.",
      accessor: (row) => row.header?.docNo,
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.header?.date,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant Id",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "itemCode",
      label: "Item Code",
      accessor: (row) => row.header?.itemCode,
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: (row) => row.header?.partyName,
      type: "text",
    },
    {
      key: "validationReason",
      label: "Validation Reason",
      accessor: (row) => row.header?.validationReason,
      type: "text",
    },
    {
      key: "recommendedForProduction",
      label: "Recommended For Production",
      accessor: (row) => row.processVadSummary?.recommendedForProduction,
      type: "badge",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["header.docNo", "header.itemCode", "header.partyName"];

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

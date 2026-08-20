import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ConsumptionEntryList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [consumptionData, setConsumptionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadConsumptionEntries = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await consumptionEntryAPI.getConsumptionEntryByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setConsumptionData(sortedData);
    } catch (error) {
      console.error("Failed to load consumption entries:", error);
      setConsumptionData([]);
      toast.error("Failed to fetch consumption entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadConsumptionEntries();
  }, [loadConsumptionEntries, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Doc Id",
      accessor: (row) => row.header?.docId,
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.header?.docDate,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "location",
      label: "Location",
      accessor: (row) => row.header?.location,
      type: "text",
    },
    {
      key: "consumption",
      label: "Consumption ?",
      accessor: (row) => row.header?.consumption,
      type: "badge",
    },
    {
      key: "type",
      label: "Type",
      accessor: (row) => row.header?.itemType,
      type: "text",
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

  const searchFields = ["header.docId", "header.location"];

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

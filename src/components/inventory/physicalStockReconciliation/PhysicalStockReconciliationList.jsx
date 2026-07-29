import { useCallback, useEffect, useState } from "react";
import physicalStockReconciliationAPI from "../../../api/Inventory/physicalStockReconciliationAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const PhysicalStockReconciliationList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [reconciliationData, setReconciliationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadReconciliations = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await physicalStockReconciliationAPI.getReconciliationByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setReconciliationData(sortedData);
    } catch (error) {
      console.error("Failed to load physical stock reconciliations:", error);
      setReconciliationData([]);
      toast.error("Failed to fetch physical stock reconciliations");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadReconciliations();
  }, [loadReconciliations, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No.",
      accessor: (row) => row.header?.docNo,
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc. Date",
      accessor: (row) => row.header?.docDate,
      type: "date",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: (row) => row.header?.plantId,
      type: "text",
    },
    {
      key: "location",
      label: "Location",
      accessor: (row) => row.header?.location,
      type: "text",
    },
    {
      key: "locationType",
      label: "Location Type",
      accessor: (row) => row.header?.locationType,
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: (row) => row.header?.preparedBy,
      type: "text",
    },
    {
      key: "approvedByPM",
      label: "Approved By PM",
      accessor: (row) => row.summary?.approvedByPM,
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

  const searchFields = ["header.docNo", "header.location", "header.preparedBy"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Physical Stock Re-Conciliation"
        data={reconciliationData}
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
        emptyMessage="No Physical Stock Reconciliations found"
        loadingMessage="Loading Physical Stock Reconciliations..."
        enableRefresh={true}
        onRefresh={loadReconciliations}
        enableExport={true}
        exportFileName="PhysicalStockReconciliations"
      />
    </div>
  );
};

export default PhysicalStockReconciliationList;

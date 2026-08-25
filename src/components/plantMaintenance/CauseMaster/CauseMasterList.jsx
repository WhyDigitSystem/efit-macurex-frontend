import { useCallback, useEffect, useState } from "react";
import causeMasterAPI from "../../../api/plantMaintenance/causeMasterAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const CauseMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [causeData, setCauseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadCauses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await causeMasterAPI.getCauses(ORG_ID);

      const sortedCauses = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setCauseData(sortedCauses);
    } catch (error) {
      console.error("Failed to load causes:", error);
      setCauseData([]);
      toast.error("Failed to fetch Causes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadCauses();
  }, [loadCauses, refreshTrigger]);

  const handleEdit = (cause) => {
    onEdit(cause);
  };

  const columns = [
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
      noWrap: true,
    },
    {
      key: "maintenanceType",
      label: "Maintenance Type",
      accessor: "maintenanceType",
      type: "text",
      noWrap: true,
    },
    {
      key: "causeCode",
      label: "Cause Code",
      accessor: "causeCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "cause",
      label: "Cause",
      accessor: "cause",
      type: "text",
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
    "department",
    "maintenanceType",
    "causeCode",
    "cause",
  ];

  return (
    <CommonListViewTable
      title="Cause Master"
      subtitle="Plant Maintenance - Manage causes and history"
      data={causeData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      itemsPerPageOptions={[5, 10, 25, 50, 100]}
      defaultItemsPerPage={10}
      showSerialNumber={true}
      emptyMessage="No Causes found"
      loadingMessage="Loading Causes..."
      enableRefresh={true}
      onRefresh={loadCauses}
      enableExport={true}
      exportFileName="Causes"
    />
  );
};

export default CauseMasterList;

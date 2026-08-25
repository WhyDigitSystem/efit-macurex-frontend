import { useCallback, useEffect, useState } from "react";
import pmChecklistMasterAPI from "../../../api/plantMaintenance/pmChecklistMasterAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const PMChecklistMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [checklistData, setChecklistData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadChecklists = useCallback(async () => {
    try {
      setLoading(true);

      const response = await pmChecklistMasterAPI.getChecklists(ORG_ID);

      const sorted = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setChecklistData(sorted);
    } catch (error) {
      console.error("Failed to load PM checklists:", error);
      setChecklistData([]);
      toast.error("Failed to fetch PM Checklists");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists, refreshTrigger]);

  const handleEdit = (checklist) => {
    onEdit(checklist);
  };

  const columns = [
    {
      key: "documentNo",
      label: "Document No",
      accessor: "documentNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
      noWrap: true,
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "pmChecklistFor",
      label: "PM Checklist For",
      accessor: "pmChecklistFor",
      type: "text",
      noWrap: true,
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
      noWrap: true,
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
    "documentNo",
    "plantName",
    "department",
    "pmChecklistFor",
    "pmChecklistNo",
  ];

  return (
    <CommonListViewTable
      title="PM Checklist Master"
      subtitle="Plant Maintenance - Manage PM checklists and history"
      data={checklistData}
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
      emptyMessage="No PM Checklists found"
      loadingMessage="Loading PM Checklists..."
      enableRefresh={true}
      onRefresh={loadChecklists}
      enableExport={true}
      exportFileName="PMChecklists"
    />
  );
};

export default PMChecklistMasterList;

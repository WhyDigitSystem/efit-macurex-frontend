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

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  /* getPMCheckListMasterByOrgId requires BOTH branch and orgId (same
     requirement confirmed on the other vendorComplaintEntry screens). */
  const loadChecklists = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;

    try {
      setLoading(true);

      const response = await pmChecklistMasterAPI.getChecklists(
        BRANCH_ID,
        ORG_ID,
      );

      const sorted = (response || []).sort((a, b) => (b.id || 0) - (a.id || 0));

      setChecklistData(sorted);
    } catch (error) {
      console.error("Failed to load PM checklists:", error);
      setChecklistData([]);
      toast.error("Failed to fetch PM Checklists");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists, refreshTrigger]);

  const handleEdit = (checklist) => {
    onEdit(checklist);
  };

  /* Columns read the confirmed nested response shape:
     branch.branchName, department.departmentName, toolCategory.category,
     preparedBy.employeeName/approvedBy.employeeName. There is no
     documentNo or date field anywhere in the confirmed response, so
     pmCheckListNo is used as the row identifier instead. */
  const columns = [
    {
      key: "pmCheckListNo",
      label: "PM Check List No",
      accessor: "pmCheckListNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) => row.branch?.branchName,
      type: "text",
      noWrap: true,
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.department?.departmentName,
      type: "text",
    },
    {
      key: "pmCheckListFor",
      label: "PM Check List For",
      accessor: "pmCheckListFor",
      type: "text",
      noWrap: true,
    },
    {
      key: "toolCategory",
      label: "Machine/Tool Category",
      accessor: (row) => row.toolCategory?.category,
      type: "text",
      noWrap: true,
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
    "pmCheckListNo",
    "branch.branchName",
    "department.departmentName",
    "pmCheckListFor",
    "toolCategory.category",
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

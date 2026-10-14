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

  const loadChecklists = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      setChecklistData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await pmChecklistMasterAPI.getChecklists(
        BRANCH_ID,
        ORG_ID,
      );

      const sorted = (response || []).sort(
        (a, b) => Number(b.id || 0) - Number(a.id || 0),
      );

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

  const columns = [
    {
      key: "docId",
      label: "Document No",
      accessor: (row) => row.docId || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Document Date",
      accessor: (row) => row.docDate || "-",
      type: "date",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Plant",
      accessor: (row) =>
        row.branch?.branchName || row.branch?.branchCode || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        row.department?.departmentName || row.department?.departmentCode || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "pmCheckListNo",
      label: "PM Check List No",
      accessor: (row) => row.pmCheckListNo || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "pmCheckListFor",
      label: "PM Check List For",
      accessor: (row) => row.pmCheckListFor || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "toolCategory",
      label: "Machine/Tool Category",
      accessor: (row) => row.toolCategory?.category || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: (row) => row.preparedBy?.employeeName || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "approvedBy",
      label: "Approved By",
      accessor: (row) => row.approvedBy?.employeeName || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "activityCount",
      label: "Activity Count",
      accessor: (row) => (row.pmCheckListDetailsResponseDTO || []).length,
      type: "number",
    },
    {
      key: "totalHours",
      label: "Total Hours",
      accessor: (row) =>
        (row.pmCheckListDetailsResponseDTO || [])
          .reduce((total, detail) => total + Number(detail.noOfHrs || 0), 0)
          .toFixed(2),
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) => (row.active ? "Active" : "Inactive"),
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
      key: "createdBy",
      label: "Created By",
      accessor: (row) => row.createdBy || "-",
      type: "text",
      noWrap: true,
    },
    {
      key: "financialYear",
      label: "Financial Year",
      accessor: (row) => row.financialYear || "-",
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
    "docId",
    "docDate",
    "pmCheckListNo",
    "pmCheckListFor",
    "branch.branchName",
    "branch.branchCode",
    "department.departmentName",
    "department.departmentCode",
    "toolCategory.category",
    "preparedBy.employeeName",
    "approvedBy.employeeName",
    "createdBy",
    "financialYear",
    "cancelRemarks",
  ];

  return (
    <div className="h-full flex flex-col">
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
    </div>
  );
};

export default PMChecklistMasterList;

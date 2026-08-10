import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import qualityScrapNoteAPI from "../../../api/quality/qualityScrapNoteAPI";
import { toast } from "../../../utils/toast";

const QualityScrapNoteList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await qualityScrapNoteAPI.getQualityScrapNoteByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load quality scrap notes:", error);
      setRecords([]);
      toast.error("Failed to fetch Quality Scrap Notes");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "snNo",
      label: "SN No",
      accessor: (row) => row.snNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "snDate",
      label: "SN Date",
      accessor: (row) => row.snDate,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: (row) => row.belongsTo,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName || row.department.id
          : row.department,
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => row.fromLocation,
      type: "text",
    },
    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => row.toLocation,
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: (row) =>
        typeof row.preparedBy === "object"
          ? row.preparedBy.employeeName || row.preparedBy.name || row.preparedBy.id
          : row.preparedBy,
      type: "text",
    },
    {
      key: "totalScrapValue",
      label: "Total Scrap Value",
      accessor: (row) => row.totalScrapValue,
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
    "snNo",
    "snDate",
    "plantId",
    "plantId.branchName",
    "plantName",
    "belongsTo",
    "department",
    "department.departmentName",
    "fromLocation",
    "toLocation",
    "preparedBy",
    "preparedBy.employeeName",
    "preparedBy.name",
    "totalScrapValue",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  return (
    <CommonListViewTable
      title="Quality Scrap Note"
      data={records}
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
      emptyMessage="No Quality Scrap Notes found"
      loadingMessage="Loading Quality Scrap Notes..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="QualityScrapNotes"
    />
  );
};

export default QualityScrapNoteList;

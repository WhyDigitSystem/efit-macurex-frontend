import { useCallback, useEffect, useState } from "react";
import causeMasterAPI from "../../../api/plantMaintenance/causeMasterAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const CauseMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [causeData, setCauseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const loadCauses = useCallback(async () => {
    if (!ORG_ID) {
      setCauseData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await causeMasterAPI.getByOrgId(ORG_ID);

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

  /* ---------------- Accessors ---------------- */

  const getDepartmentLabel = (row) =>
    row?.department?.departmentName ||
    row?.department?.departmentCode ||
    (typeof row?.department === "string" ? row.department : "") ||
    "";

  const getMaintenanceTypeLabel = (row) =>
    row?.maintenanceType?.description ||
    row?.maintenanceType?.code ||
    (typeof row?.maintenanceType === "string" ? row.maintenanceType : "") ||
    "";

  /* ---------------- Columns ---------------- */

  const columns = [
    {
      key: "department",
      label: "Department",
      accessor: (row) => getDepartmentLabel(row),
      type: "text",
      noWrap: true,
    },
    {
      key: "maintenanceType",
      label: "Maintenance Type",
      accessor: (row) => getMaintenanceTypeLabel(row),
      type: "text",
      noWrap: true,
    },
    {
      key: "causeCode",
      label: "Cause Code",
      accessor: (row) => row?.causeCode || "",
      type: "text",
      noWrap: true,
    },
    {
      key: "cause",
      label: "Cause",
      accessor: (row) => row?.cause || "",
      type: "text",
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
    "department.departmentName",
    "maintenanceType.description",
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
// ActivitiesCarriedOutList.jsx
import React, { useEffect, useState, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import activitiesCarriedOutAPI from "../../../api/plantMaintenance/activitiesCarriedOutAPI";
import { useToast } from "../../Toast/ToastContext";

// "2026-10-16" -> "16/10/2026"
const fmtDate = (v) => {
  if (!v) return "";
  const [y, m, d] = String(v).slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : String(v);
};

const toListRow = (r) => {
  const details = r.activitiesCarriedOutDetailsResponseDTO || [];
  const components = r.activitiesCarriedOutComponentDetailsResponseDTO || [];

  const allCompleted =
    details.length > 0 &&
    details.every((d) => String(d.status).toLowerCase() === "completed");

  return {
    id: r.id,
    docId: r.docId,
    plantId: r.branch?.branchName || r.branch?.branchCode || "",
    department:
      r.department?.departmentName || r.department?.departmentCode || "",
    machineTool: [r.selectMachineToolInst?.applicableFor, r.machineToolInstNo]
      .filter(Boolean)
      .join(" - "),
    date: fmtDate(r.docDate),
    maintenanceType: r.maintenanceType?.description || "",
    status: allCompleted ? "Completed" : "Pending",
    totalAmount: components
      .reduce((a, c) => a + (Number(c.amount) || 0), 0)
      .toFixed(2),
    active: r.active === "Active" || r.active === true,
    // normalised copy used to open the form without another call
    raw: activitiesCarriedOutAPI.toFormData(r),
  };
};

const ActivitiesCarriedOutList = ({ onAddNew, onEdit, onBack }) => {
  const { addToast } = useToast();
  const orgId = localStorage.getItem("orgId");
  const branchId = localStorage.getItem("branchId");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!orgId || !branchId) return;
    setLoading(true);
    try {
      const list = await activitiesCarriedOutAPI.getActivitiesCarriedOutByOrgId(
        orgId,
        branchId,
      );
      const rows = list.map(toListRow);
      rows.sort((a, b) => b.id - a.id);
      setData(rows);
    } catch (err) {
      console.error("Failed to load Activities Carried Out:", err);
      addToast("Failed to load Activities Carried Out records", "error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch the latest copy by id; fall back to the list's copy if that fails
  const handleEdit = async (row) => {
    try {
      const fresh = await activitiesCarriedOutAPI.getActivitiesCarriedOutById(
        row.id,
      );
      onEdit(fresh || row.raw);
    } catch {
      onEdit(row.raw);
    }
  };

  const columns = [
    {
      key: "docId",
      label: "Doc ID",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: "plantId",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "machineTool",
      label: "Machine/Tool",
      accessor: "machineTool",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
      noWrap: true,
    },
    {
      key: "maintenanceType",
      label: "Maintenance Type",
      accessor: "maintenanceType",
      type: "text",
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
      type: "status",
      statusVariants: {
        Completed: {
          label: "Completed",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        Pending: {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        },
        "In Progress": {
          label: "In Progress",
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        },
      },
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "text",
      align: "right",
    },
    {
      key: "active",
      label: "Active",
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
    "docId",
    "plantId",
    "department",
    "machineTool",
    "maintenanceType",
  ];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
    },
    {
      value: "completed",
      label: "Completed",
      field: "status",
      filterValue: "completed",
      activeValue: "Completed",
    },
    {
      value: "pending",
      label: "Pending",
      field: "status",
      filterValue: "pending",
      activeValue: "Pending",
    },
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
      title="Activities Carried Out"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Activities Carried Out records found"
      loadingMessage="Loading Activities Carried Out records..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Activities_Carried_Out"
    />
  );
};

export default ActivitiesCarriedOutList;

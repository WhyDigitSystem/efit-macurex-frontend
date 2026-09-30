import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import maintenanceServiceRequestAPI from "../../../api/plantMaintenance/maintenanceServiceRequestAPI";
import { useToast } from "../../Toast/ToastContext";

const MaintenanceServiceRequestList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadServiceRequests = useCallback(async () => {
    if (!ORG_ID) {
      setRequestData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const list =
        await maintenanceServiceRequestAPI.getMaintenanceServiceRequestByOrgId(
          ORG_ID
        );

      const sorted = (list || []).sort(
        (a, b) => Number(b.id || 0) - Number(a.id || 0)
      );

      setRequestData(sorted);
    } catch (error) {
      console.error("Failed to load maintenance service requests:", error);
      addToast("Failed to fetch maintenance service requests", "error");
      setRequestData([]);
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, addToast]);

  useEffect(() => {
    loadServiceRequests();
  }, [loadServiceRequests, refreshTrigger]);

  const columns = [
    {
      key: "mpNo",
      label: "MP No",
      accessor: (row) => row.docId || row.mpNo || "-",
      type: "text",
    },
    {
      key: "reportedDate",
      label: "Reported Date",
      accessor: (row) => row.reportedDate || row.closingDate || "-",
      type: "date",
    },
    {
      key: "belongTo",
      label: "Belong To",
      accessor: (row) =>
        row.belongTo?.description || row.belongTo?.code || "-",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        row.department?.departmentName ||
        row.department?.departmentCode ||
        "-",
      type: "text",
    },
    {
      key: "requestedBy",
      label: "Requested By",
      accessor: (row) => row.requestedBy?.employeeName || "-",
      type: "text",
    },
    {
      key: "priority",
      label: "Priority",
      accessor: (row) =>
        row.priority?.description || row.priority?.code || "-",
      type: "badge",
    },
    {
      key: "completed",
      label: "Completed",
      accessor: (row) => row.completed || "-",
      type: "badge",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) => (row.active ? "Active" : "Inactive"),
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

  const searchFields = [
    "belongTo.description",
    "department.departmentName",
    "requestedBy.employeeName",
    "priority.description",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Maintenance Service Request"
        data={requestData}
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
        emptyMessage="No Maintenance Service Requests found"
        loadingMessage="Loading Maintenance Service Requests..."
        enableRefresh={true}
        onRefresh={loadServiceRequests}
        enableExport={true}
        exportFileName="MaintenanceServiceRequests"
      />
    </div>
  );
};

export default MaintenanceServiceRequestList;
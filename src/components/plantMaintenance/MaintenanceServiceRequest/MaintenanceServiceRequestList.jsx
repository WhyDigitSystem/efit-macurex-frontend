import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const MaintenanceServiceRequestList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadServiceRequests = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await maintenanceServiceRequestAPI.getMaintenanceServiceRequestByOrgId(
          ORG_ID,
        );

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setRequestData(sortedData);
    } catch (error) {
      console.error("Failed to load maintenance service requests:", error);
      setRequestData([]);
      toast.error("Failed to fetch maintenance service requests");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadServiceRequests();
  }, [loadServiceRequests, refreshTrigger]);

  const columns = [
    {
      key: "mpNo",
      label: "MP No",
      accessor: (row) => row.header?.mpNo,
      type: "text",
    },
    {
      key: "reportedDate",
      label: "Reported Date",
      accessor: (row) => row.header?.reportedDate,
      type: "date",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "requestedBy",
      label: "Requested By",
      accessor: (row) => row.header?.requestedBy,
      type: "text",
    },
    {
      key: "priority",
      label: "Priority",
      accessor: (row) => row.header?.priority,
      type: "badge",
    },
    {
      key: "completed",
      label: "Completed",
      accessor: (row) => row.header?.completed,
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

  const searchFields = [
    "header.mpNo",
    "header.requestedBy",
    "header.department",
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

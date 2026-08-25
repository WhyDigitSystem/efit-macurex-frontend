import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const MachineToolRectificationList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [rectificationData, setRectificationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadRectifications = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await machineToolRectificationAPI.getMachineToolRectificationByOrgId(
          ORG_ID,
        );

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setRectificationData(sortedData);
    } catch (error) {
      console.error("Failed to load machine/tool rectifications:", error);
      setRectificationData([]);
      toast.error("Failed to fetch machine/tool rectifications");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadRectifications();
  }, [loadRectifications, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No.",
      accessor: (row) => row.header?.docNo,
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.header?.date,
      type: "date",
    },
    {
      key: "plant",
      label: "Plant ID",
      accessor: (row) => row.header?.plant,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },
    {
      key: "machineToolNo",
      label: "Machine No. / Tool No.",
      accessor: (row) => row.header?.machineToolNo,
      type: "text",
    },
    {
      key: "maintenanceType",
      label: "Maintenance Type",
      accessor: (row) => row.header?.maintenanceType,
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
    "header.docNo",
    "header.machineToolNo",
    "header.breakdownNo",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Machine/Tool Rectification"
        data={rectificationData}
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
        emptyMessage="No Machine/Tool Rectifications found"
        loadingMessage="Loading Machine/Tool Rectifications..."
        enableRefresh={true}
        onRefresh={loadRectifications}
        enableExport={true}
        exportFileName="MachineToolRectifications"
      />
    </div>
  );
};

export default MachineToolRectificationList;

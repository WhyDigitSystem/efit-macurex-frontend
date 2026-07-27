import { useCallback, useEffect, useState } from "react";
import salesZoneAPI from "../../../api/salesZoneAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const SalesZoneMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadZones = useCallback(async () => {
    try {
      setLoading(true);

      const response = await salesZoneAPI.getSalesZoneByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setZoneData(sortedData);
    } catch (error) {
      console.error("Failed to load sales zones:", error);
      setZoneData([]);
      toast.error("Failed to fetch sales zones");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadZones();
  }, [loadZones, refreshTrigger]);

  const columns = [
    {
      key: "zoneId",
      label: "Zone Id",
      accessor: "zoneId",
      type: "text",
    },
    {
      key: "zoneDescription",
      label: "Zone Description",
      accessor: "zoneDescription",
      type: "text",
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

  const searchFields = ["zoneId", "zoneDescription"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Sales Zone"
        data={zoneData}
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
        emptyMessage="No Sales Zones found"
        loadingMessage="Loading Sales Zones..."
        enableRefresh={true}
        onRefresh={loadZones}
        enableExport={true}
        exportFileName="SalesZones"
      />
    </div>
  );
};

export default SalesZoneMasterList;

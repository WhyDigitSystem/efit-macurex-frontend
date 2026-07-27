import { useCallback, useEffect, useState } from "react";
import partyAccountMappingAPI from "../../../api/partyAccountMappingAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const PartyAccountMappingList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [mappingData, setMappingData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadMappings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await partyAccountMappingAPI.getMappingByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setMappingData(sortedData);
    } catch (error) {
      console.error("Failed to load party account mappings:", error);
      setMappingData([]);
      toast.error("Failed to fetch party account mappings");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "Doc Id",
      accessor: "docId",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "date",
    },
    {
      key: "asOnDate",
      label: "As On Date",
      accessor: "asOnDate",
      type: "date",
    },
    {
      key: "category",
      label: "Category",
      accessor: "category",
      type: "badge",
    },
    {
      key: "mappingCount",
      label: "Mappings",
      accessor: (row) => row.mappingDetails?.length ?? row.mappingCount ?? 0,
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

  const searchFields = ["docId", "category"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Mapping Of Party To Account"
        data={mappingData}
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
        emptyMessage="No Party To Account Mappings found"
        loadingMessage="Loading Party To Account Mappings..."
        enableRefresh={true}
        onRefresh={loadMappings}
        enableExport={true}
        exportFileName="PartyAccountMappings"
      />
    </div>
  );
};

export default PartyAccountMappingList;

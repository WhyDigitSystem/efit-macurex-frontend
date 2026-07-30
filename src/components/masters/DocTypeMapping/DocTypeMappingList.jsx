import { useCallback, useEffect, useRef, useState } from "react";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DocTypeMappingList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [mappingData, setMappingData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId")||1000000001);
  const prevRefreshRef = useRef(refreshTrigger);

  const loadMappings = useCallback(async () => {
    if (!ORG_ID || !BRANCH) return;
    try {
      setLoading(true);

      const response = await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
        ORG_ID,
        BRANCH,
      );

      const flattened = (response || []).map((item) => ({
        ...item,
        branchName: item.branch?.branchName || "",
        finYear: item.financialYear?.finYear || "",
        detailsCount: item.details?.length || 0,
      }));

      const sortedData = flattened.sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setMappingData(sortedData);
    } catch (error) {
      console.error("Failed to load doc type mappings:", error);
      setMappingData([]);
      toast.error("Failed to fetch doc type mappings");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  useEffect(() => {
    if (prevRefreshRef.current !== refreshTrigger) {
      prevRefreshRef.current = refreshTrigger;
      loadMappings();
    }
  }, [refreshTrigger, loadMappings]);

  const columns = [
    {
      key: "description",
      label: "Description",
      accessor: "description",
      type: "text",
    },
    {
      key: "branchName",
      label: "Branch",
      accessor: "branchName",
      type: "text",
    },
    {
      key: "finYear",
      label: "Financial Year",
      accessor: "finYear",
      type: "text",
    },
    {
      key: "detailsCount",
      label: "Details",
      accessor: "detailsCount",
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

  const searchFields = ["description", "branchName"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Doc Type Mapping"
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
        emptyMessage="No Doc Type Mappings found"
        loadingMessage="Loading Doc Type Mappings..."
        enableRefresh={true}
        onRefresh={loadMappings}
        enableExport={true}
        exportFileName="DocTypeMappings"
      />
    </div>
  );
};

export default DocTypeMappingList;
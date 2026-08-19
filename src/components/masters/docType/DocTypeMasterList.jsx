import { useCallback, useEffect, useState } from "react";
import docTypeAPI from "../../../api/docTypeAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DocTypeMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [documentTypeData, setDocumentTypeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const loadDocumentTypes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await docTypeAPI.getAllDocumentTypeMasterByOrgId(ORG_ID);

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setDocumentTypeData(sortedData);
    } catch (error) {
      console.error("Failed to load document types:", error);
      setDocumentTypeData([]);
      toast.error("Failed to fetch document types");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadDocumentTypes();
  }, [loadDocumentTypes, refreshTrigger]);

  const columns = [
    {
      key: "screenCode",
      label: "Code",
      accessor: "screenCode",
      type: "text",
    },
    {
      key: "screenName",
      label: "Name",
      accessor: "screenName",
      type: "text",
    },
    {
      key: "docCode",
      label: "Doc Code",
      accessor: "docCode",
      type: "text",
    },
    {
      key: "description",
      label: "Description",
      accessor: "description",
      type: "text",
    },

    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["screenCode", "screenName", "docCode", "description"];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Document Type Master"
        data={documentTypeData}
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
        emptyMessage="No Document Types found"
        loadingMessage="Loading Document Types..."
        enableRefresh={true}
        onRefresh={loadDocumentTypes}
        enableExport={true}
        exportFileName="DocumentTypeMaster"
      />
    </div>
  );
};

export default DocTypeMasterList;

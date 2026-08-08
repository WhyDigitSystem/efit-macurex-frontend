import { useCallback, useEffect, useState } from "react";
import parameterMasterAPI from "../../../api/quality/parameterMasterAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ParameterMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [parameterData, setParameterData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const loadParameters = useCallback(async () => {
    try {
      setLoading(true);

      const response = await parameterMasterAPI.getParameters(ORG_ID);

      const sortedParameters = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setParameterData(sortedParameters);
    } catch (error) {
      console.error("Failed to load parameters:", error);
      setParameterData([]);
      toast.error("Failed to fetch Parameters");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadParameters();
  }, [loadParameters, refreshTrigger]);

  const handleEdit = (parameter) => {
    onEdit(parameter);
  };

  const columns = [
    {
      key: "parameterId",
      label: "Parameter Id",
      accessor: "parameterId",
      type: "text",
      noWrap: true,
    },
    {
      key: "parameterType",
      label: "Parameter Type",
      accessor: "parameterType",
      type: "text",
    },
    {
      key: "parameterDescription",
      label: "Description",
      accessor: "parameterDescription",
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

  const searchFields = ["parameterId", "parameterType", "parameterDescription"];

  return (
    <CommonListViewTable
      title="Parameter Master"
      subtitle="Quality - Manage parameters, types and history"
      data={parameterData}
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
      emptyMessage="No Parameters found"
      loadingMessage="Loading Parameters..."
      enableRefresh={true}
      onRefresh={loadParameters}
      enableExport={true}
      exportFileName="Parameters"
    />
  );
};

export default ParameterMasterList;

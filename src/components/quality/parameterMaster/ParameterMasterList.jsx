import { useCallback, useEffect, useState } from "react";
import parameterMasterAPI from "../../../api/quality/parameterMasterAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const ParameterMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [parameterData, setParameterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeOptions, setTypeOptions] = useState([]);

  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;

  const loadTypeOptions = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const options = await parameterMasterAPI.getParameterTypeOptions(ORG_ID);

      setTypeOptions(options);
    } catch (error) {
      console.error("Failed to load parameter type options:", error);

      setTypeOptions([]);
    }
  }, [ORG_ID]);

  const loadParameters = useCallback(async () => {
    try {
      setLoading(true);

      if (!ORG_ID) {
        console.error("Missing orgId");

        setParameterData([]);

        toast.error("Organization is missing");

        return;
      }

      const response =
        await parameterMasterAPI.getParameterMasterByOrgId(ORG_ID);

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
    loadTypeOptions();
    loadParameters();
  }, [loadTypeOptions, loadParameters, refreshTrigger]);

  const handleEdit = (parameter) => {
    onEdit(parameter);
  };

  /* -------------------------------------------------------------------------- */
  /* Resolve Parameter Type -> display label                                    */
  /*                                                                              */
  /* Backend has been observed to return parameterType as EITHER:               */
  /*   - a plain id (number/string), which we look up in typeOptions            */
  /*   - a full object { id, code, description }                                */
  /*                                                                              */
  /* This must NEVER return an object/array - React can't render those directly */
  /* inside a <td>, which is what was causing the "Objects are not valid as a   */
  /* React child" crash.                                                         */
  /* -------------------------------------------------------------------------- */

  const resolveTypeLabel = (typeValue) => {
    if (typeValue === null || typeValue === undefined || typeValue === "") {
      return "";
    }

    /* Case 1: backend already returned the full object */

    if (typeof typeValue === "object") {
      return (
        typeValue.description ||
        typeValue.valuesDescription ||
        typeValue.code ||
        typeValue.name ||
        String(typeValue.id ?? "")
      );
    }

    /* Case 2: backend returned just the id, resolve via typeOptions */

    const match = typeOptions.find(
      (option) => String(option.value) === String(typeValue),
    );

    return match ? match.label : String(typeValue);
  };

  /* -------------------------------------------------------------------------- */
  /* Columns                                                                    */
  /* -------------------------------------------------------------------------- */

  const columns = [
    {
      key: "parameterCode",
      label: "Parameter Code",
      accessor: "parameterCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "parameterType",
      label: "Parameter Type",
      accessor: "parameterType",
      type: "text",
      render: (value) => (
        <span className="text-gray-900 dark:text-white">
          {resolveTypeLabel(value)}
        </span>
      ),
    },
    {
      key: "parameterDescription",
      label: "Description",
      accessor: "parameterDescription",
      type: "text",
    },
    {
      key: "screenName",
      label: "Screen Name",
      accessor: "screenName",
      type: "text",
    },
    {
      key: "screenCode",
      label: "Screen Code",
      accessor: "screenCode",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
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
    "parameterCode",
    "parameterDescription",
    "screenName",
    "screenCode",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },

    {
      value: "active",
      label: "Active",
      field: "active",
      filterValue: true,
      activeValue: true,
    },

    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
      activeValue: false,
    },
  ];

  return (
    <CommonListViewTable
      title="Parameter Master"
      subtitle="Quality - Manage parameters, types and history"
      data={parameterData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
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

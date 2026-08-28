import { useCallback, useEffect, useState } from "react";
import { designationAPI } from "../../../api/designationAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DesignationListView = ({ onAddNew, onEdit, onBack }) => {
  const [designationData, setDesignationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const branch = parseInt(localStorage.getItem("branchId"));

  const loadDesignations = useCallback(async () => {
    try {
      setLoading(true);

      const response = await designationAPI.getAllDesignations(ORG_ID);

      let designations = [];

      if (response?.status === true) {
        designations = response.paramObjectsMap?.designationVO || [];
      }

      // Transform data if needed
      const transformedDesignations = designations.map(designation => ({
        ...designation,
        // Ensure consistency in field names
        designationName: designation.designation || designation.designationName || "",
        designationCode: designation.designationCode || designation.code || "",
      }));

      transformedDesignations.sort((a, b) => (b.id || 0) - (a.id || 0));

      setDesignationData(transformedDesignations);
    } catch (error) {
      console.error("Failed to load designations:", error);
      setDesignationData([]);
      toast.error("Failed to fetch Designations");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadDesignations();
  }, [loadDesignations]);

  const columns = [
    {
      key: "designationCode",
      label: "Code",
      accessor: "designationCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "designationName",
      label: "Designation Name",
      accessor: "designationName",
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
        Active: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        Inactive: {
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

  const searchFields = ["designationCode", "designationName"];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
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
      title="Designation"
      data={designationData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Designations found"
      loadingMessage="Loading Designations..."
      enableRefresh={true}
      onRefresh={loadDesignations}
      enableExport={true}
      exportFileName="Designations"
    />
  );
};

export default DesignationListView;
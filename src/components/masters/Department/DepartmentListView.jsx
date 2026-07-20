import { useCallback, useEffect, useState } from "react";
import { departmentAPI } from "../../../api/departmentAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DepartmentListView = ({ onAddNew, onEdit }) => {
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = parseInt(localStorage.getItem("orgId"));


  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await departmentAPI.getAllDepartments(ORG_ID);

      let departments = [];

      if (response?.status === true) {
        departments = response.paramObjectsMap?.departmentVOs || [];
      }

      departments.sort((a, b) => (b.id || 0) - (a.id || 0));

      setDepartmentData(departments);

    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentData([]);
      toast.error("Failed to fetch Departments");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);


  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);



  const columns = [
    {
      key: "code",
      label: "Code",
      accessor: "code",
      type: "text",
      noWrap: true,
    },
    {
      key: "departmentName",
      label: "Department Name",
      accessor: "departmentName",
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



  const searchFields = [
    "code",
    "departmentName",
  ];



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
      title="Department Master"
      subtitle="Manage Departments"

      data={departmentData}
      loading={loading}

      columns={columns}

      searchFields={searchFields}

      filterOptions={filterOptions}
      defaultFilter="all"

      onAddNew={onAddNew}
      onEdit={onEdit}

      onView={false}

      showSerialNumber={true}

      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}

      emptyMessage="No Departments found"
      loadingMessage="Loading Departments..."

      enableRefresh={true}
      onRefresh={loadDepartments}

      enableExport={true}
      exportFileName="Departments"
    />
  );
};

export default DepartmentListView;
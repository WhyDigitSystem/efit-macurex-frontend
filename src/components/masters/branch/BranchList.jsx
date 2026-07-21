import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import apiClient from "../../../api/apiClient";
import { toast } from "../../../utils/toast";

const BranchMasterList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [branchData, setBranchData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(
        `/api/warehousemastercontroller/branch?orgid=${ORG_ID}`,
      );

      let branches = [];

      if (Array.isArray(response)) {
        branches = response;
      } else if (response?.paramObjectsMap?.branchVO) {
        branches = response.paramObjectsMap.branchVO;
      } else if (response?.data) {
        branches = response.data;
      }

      branches.sort((a, b) => (b.id || 0) - (a.id || 0));

      setBranchData(branches);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchData([]);
      toast.error("Failed to fetch Branches");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches, refreshTrigger]);

  const columns = [
    {
      key: "branchCode",
      label: "Branch Code",
      accessor: "branchCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Branch Name",
      accessor: "branch",
      type: "text",
    },
    {
      key: "city",
      label: "City",
      accessor: "city",
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

  const searchFields = ["branchCode", "branch", "city"];

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
      title="Branch"
      
      data={branchData}
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
      emptyMessage="No Branches found"
      loadingMessage="Loading Branches..."
      enableRefresh={true}
      onRefresh={loadBranches}
      enableExport={true}
      exportFileName="Branches"
    />
  );
};

export default BranchMasterList;

import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { branchAPI } from "../../../api/branchAPI";
import { toast } from "../../../utils/toast";

const BranchMasterList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [branchData, setBranchData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);

      const branches = await branchAPI.getBranchByOrgId(ORG_ID);

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
    },
    {
      key: "branchName",
      label: "Branch Name",
      accessor: "branchName",
      type: "text",
    },
    {
      key: "branchIncharge",
      label: "Branch Incharge",
      accessor: "branchIncharge",
      type: "text",
    },
    {
      key: "phoneNo",
      label: "Mobile",
      accessor: "phoneNo",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      type: "text",
    },
    {
      key: "division",
      label: "Division",
      accessor: "division",
      type: "text",
    },
    // {
    //   key: "bankName",
    //   label: "Bank Name",
    //   accessor: (row) => row.bankDetailsVO?.[0]?.bankName || "-",
    //   type: "text",
    // },
    // {
    //   key: "accountNo",
    //   label: "Account No",
    //   accessor: (row) => row.bankDetailsVO?.[0]?.accountNo || "-",
    //   type: "text",
    // },
    // {
    //   key: "ifscCode",
    //   label: "IFSC",
    //   accessor: (row) => row.bankDetailsVO?.[0]?.ifscCode || "-",
    //   type: "text",
    // },
    // {
    //   key: "bankBranch",
    //   label: "Bank Branch",
    //   accessor: (row) => row.bankDetailsVO?.[0]?.bankBranch || "-",
    //   type: "text",
    // },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
      statusVariants: {
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
    "branchCode",
    "branchName",
    "branchIncharge",
    "phoneNo",
    "email",
    "division",
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

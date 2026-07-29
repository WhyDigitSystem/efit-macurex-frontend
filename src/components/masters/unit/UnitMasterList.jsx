import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import unitAPI from "../../../api/unitAPI";
import branchAPI from "../../../api/branchAPI";

const UnitMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [unitData, setUnitData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUnits = async () => {
    setLoading(true);
    setError("");

    try {
      const orgId = Number(localStorage.getItem("orgId"));

      let branch = Number(localStorage.getItem("branch"));

      // If branch is not stored in localStorage, fetch the first branch
      if (!branch) {
        const branches = await branchAPI.getBranchByOrgId(orgId);

        if (branches && branches.length > 0) {
          branch = branches[0].id || branches[0].branch || 0;
        }
      }

      const data = await unitAPI.getUnits(branch, orgId);

      console.log("Unit List:", data);

      setUnitData(
        Array.isArray(data)
          ? data.sort((a, b) => (b.id || 0) - (a.id || 0))
          : [],
      );
    } catch (err) {
      console.error("Error loading units:", err);
      setError("Failed to load units. Please try again.");
      setUnitData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleEdit = (unit) => {
    onEdit(unit);
  };

  const columns = [
    {
      key: "unitId",
      label: "Unit ID",
      accessor: "unitId",
      type: "text",
      noWrap: true,
    },
    {
      key: "description",
      label: "Description",
      accessor: "description",
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

  const searchFields = ["unitId", "description"];

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
      filterValue: true,
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
      activeValue: "Inactive",
    },
  ];

  return (
    <CommonListViewTable
      title="Unit Master"
      subtitle="Manage Units"
      data={unitData}
      loading={loading}
      error={error}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Units found"
      loadingMessage="Loading Units..."
      enableRefresh={true}
      onRefresh={loadUnits}
      enableExport={true}
      exportFileName="UnitMaster"
    />
  );
};

export default UnitMasterList;

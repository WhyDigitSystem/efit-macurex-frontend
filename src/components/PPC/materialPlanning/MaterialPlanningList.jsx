import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import materialPlanningAPI from "../../../api/PPC/materialPlanningAPI";
import { toast } from "../../../utils/toast";

const MaterialPlanningList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);

      const plans = await materialPlanningAPI.getByOrgId(ORG_ID);

      plans.sort((a, b) => (b.id || 0) - (a.id || 0));

      setPlanData(plans);
    } catch (error) {
      console.error("Failed to load material planning records:", error);
      setPlanData([]);
      toast.error("Failed to fetch Material Planning records");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: (row) => row.docNo,
      type: "text",
    },
    {
      key: "fromDate",
      label: "From Date",
      accessor: (row) => row.fromDate,
      type: "text",
    },
    {
      key: "toDate",
      label: "To Date",
      accessor: (row) => row.toDate,
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.docDate,
      type: "text",
    },
    {
      key: "mrpType",
      label: "MRP Type",
      accessor: (row) => row.mrpType,
      type: "text",
    },
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

  const searchFields = ["docNo", "mrpType", "fromDate", "toDate"];

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
      title="Material Planning"
      data={planData}
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
      emptyMessage="No Material Planning records found"
      loadingMessage="Loading Material Planning records..."
      enableRefresh={true}
      onRefresh={loadPlans}
      enableExport={true}
      exportFileName="MaterialPlanning"
    />
  );
};

export default MaterialPlanningList;
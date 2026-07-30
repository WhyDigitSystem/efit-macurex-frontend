import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { financialYearAPI } from "../../../api/financialYearAPI";
import { toast } from "../../../utils/toast";

const FinancialYearMasterList = ({
  onAddNew,
  onEdit,
  refreshTrigger,
  onBack,
}) => {
  const [financialYearData, setFinancialYearData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadFinancialYears = useCallback(async () => {
    try {
      setLoading(true);

      const years = await financialYearAPI.getFinancialYearByOrgId(ORG_ID);

      years.sort((a, b) => (b.id || 0) - (a.id || 0));

      setFinancialYearData(years);
    } catch (error) {
      console.error("Failed to load financial years:", error);
      setFinancialYearData([]);
      toast.error("Failed to fetch Financial Years");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadFinancialYears();
  }, [loadFinancialYears, refreshTrigger]);

  const columns = [
    {
      key: "finYear",
      label: "Financial Year",
      accessor: (row) =>
        row.financialYear ||
        (row.finYear ? `${row.finYear}` : "-"),
      type: "text",
    },
    {
      key: "startDate",
      label: "From Date",
      accessor: "startDate",
      type: "text",
    },
    {
      key: "endDate",
      label: "To Date",
      accessor: "endDate",
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

  const searchFields = ["financialYearCode", "startDate", "endDate"];

  const filterOptions = [
    { value: "all", label: "All", field: null },
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
      title="Financial Year"
      data={financialYearData}
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
      emptyMessage="No Financial Years found"
      loadingMessage="Loading Financial Years..."
      enableRefresh={true}
      onRefresh={loadFinancialYears}
      enableExport={true}
      exportFileName="FinancialYears"
    />
  );
};

export default FinancialYearMasterList;

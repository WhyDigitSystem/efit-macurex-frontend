import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import subContractSupplyScheduleAPI from "../../../api/subContractSupplyScheduleAPI";
import { toast } from "../../../utils/toast";

const SubContractSupplyScheduleList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        await subContractSupplyScheduleAPI.getSubContractSupplyScheduleByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load sub contract supply schedules:", error);
      setRecords([]);
      toast.error("Failed to fetch Sub Contract Supply Schedules");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: "docNo",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "schStartDate",
      label: "Sch. Start Date",
      accessor: "schStartDate",
      type: "text",
    },
    {
      key: "schEndDate",
      label: "Sch. End Date",
      accessor: "schEndDate",
      type: "text",
    },
    {
      key: "partyId",
      label: "Party Id",
      accessor: "partyId",
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
      type: "text",
    },
    {
      key: "jobOrderNo",
      label: "Job Order No",
      accessor: "jobOrderNo",
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
      type: "text",
    },
    {
      key: "authorizedBy",
      label: "Authorized By",
      accessor: "authorizedBy",
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

  const searchFields = [
    "docNo",
    "docDate",
    "plantName",
    "belongsTo",
    "schStartDate",
    "schEndDate",
    "partyId",
    "partyName",
    "contractNo",
    "jobOrderNo",
    "preparedBy",
    "authorizedBy",
  ];

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
      title="Sub Contract Supply Schedule"
      data={records}
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
      emptyMessage="No Sub Contract Supply Schedules found"
      loadingMessage="Loading Sub Contract Supply Schedules..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SubContractSupplySchedules"
    />
  );
};

export default SubContractSupplyScheduleList;
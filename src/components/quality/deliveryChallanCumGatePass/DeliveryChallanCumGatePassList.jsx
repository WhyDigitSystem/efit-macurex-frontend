import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import deliveryChallanCumGatePassAPI from "../../../api/quality/deliveryChallanCumGatePassAPI";
import { toast } from "../../../utils/toast";

const DeliveryChallanCumGatePassList = ({
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
      const data = await deliveryChallanCumGatePassAPI.getDcgpByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load delivery challan cum gate passes:", error);
      setRecords([]);
      toast.error("Failed to fetch Delivery Challan Cum Gate Passes");
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
      accessor: (row) => row.docNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row.docDate,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: (row) => row.belongsTo,
      type: "text",
    },
    {
      key: "type",
      label: "Type",
      accessor: (row) => row.type,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName || row.department.id
          : row.department,
      type: "text",
    },
    {
      key: "partyPlantId",
      label: "Party/Plant",
      accessor: (row) =>
        typeof row.partyPlantId === "object"
          ? row.partyPlantId.customerName || row.partyPlantId.id
          : row.partyPlantName || row.partyPlantId,
      type: "text",
    },
    {
      key: "refNo",
      label: "Ref No",
      accessor: (row) => row.refNo,
      type: "text",
    },
    {
      key: "fromLocation",
      label: "From Location",
      accessor: (row) => row.fromLocation,
      type: "text",
    },
    {
      key: "vehicleNo",
      label: "Vehicle No",
      accessor: (row) => row.vehicleNo,
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
    "plantId",
    "plantId.branchName",
    "plantName",
    "belongsTo",
    "type",
    "department",
    "department.departmentName",
    "partyPlantId",
    "partyPlantId.customerName",
    "partyPlantName",
    "refNo",
    "fromLocation",
    "vehicleNo",
    "workOrderNo",
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
      title="Delivery Challan Cum Gate Pass"
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
      emptyMessage="No Delivery Challan Cum Gate Passes found"
      loadingMessage="Loading Delivery Challan Cum Gate Passes..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="DeliveryChallanCumGatePasses"
    />
  );
};

export default DeliveryChallanCumGatePassList;

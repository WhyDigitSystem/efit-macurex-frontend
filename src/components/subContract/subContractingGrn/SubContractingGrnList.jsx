import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { subContractingGrnAPI } from "../../../api/Inventory/subContractingGrnAPI";
import { toast } from "../../../utils/toast";

const SubContractingGrnList = ({
  onAddNew,
  onEdit,
  refreshTrigger,
  onBack,
}) => {
  const [grnData, setGrnData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadGrns = useCallback(async () => {
    try {
      setLoading(true);

      const grns = await subContractingGrnAPI.getGrnByOrgId(ORG_ID);

      grns.sort((a, b) => (b.id || 0) - (a.id || 0));

      setGrnData(grns);
    } catch (error) {
      console.error("Failed to load sub contracting GRNs:", error);
      setGrnData([]);
      toast.error("Failed to fetch Sub Contracting GRNs");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadGrns();
  }, [loadGrns, refreshTrigger]);

  const columns = [
    {
      key: "scGrnNo",
      label: "S.C GRN No.",
      accessor: "scGrnNo",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: "plantId",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "vendorId",
      label: "Vendor Id",
      accessor: "vendorId",
      type: "text",
    },
    {
      key: "vendorName",
      label: "Vendor Name",
      accessor: "vendorName",
      type: "text",
    },
    {
      key: "gatePassNo",
      label: "Gate Pass No.",
      accessor: "gatePassNo",
      type: "text",
    },
    {
      key: "contractNo",
      label: "Contract No.",
      accessor: "contractNo",
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
    "scGrnNo",
    "plantId",
    "belongsTo",
    "department",
    "vendorId",
    "vendorName",
    "gatePassNo",
    "contractNo",
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
      title="Sub Contracting GRN"
      data={grnData}
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
      emptyMessage="No Sub Contracting GRNs found"
      loadingMessage="Loading Sub Contracting GRNs..."
      enableRefresh={true}
      onRefresh={loadGrns}
      enableExport={true}
      exportFileName="SubContractingGRNs"
    />
  );
};

export default SubContractingGrnList;

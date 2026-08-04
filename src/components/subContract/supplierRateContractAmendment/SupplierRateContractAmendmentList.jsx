import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import supplierRateContractAmendmentAPI from "../../../api/supplierRateContractAmendmentAPI";
import { toast } from "../../../utils/toast";

const SupplierRateContractAmendmentList = ({
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
        await supplierRateContractAmendmentAPI.getSupplierRateContractAmendmentByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to load supplier rate contract amendments:", error);
      setRecords([]);
      toast.error("Failed to fetch Supplier Rate Contract Amendments");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "amendmentNo",
      label: "Amendment No",
      accessor: "amendmentNo",
      type: "text",
    },
    {
      key: "amendmentDate",
      label: "Amendment Date",
      accessor: "amendmentDate",
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
      key: "contractDate",
      label: "Contract Date",
      accessor: "contractDate",
      type: "text",
    },
    {
      key: "newValidFrom",
      label: "New Valid From",
      accessor: "newValidFrom",
      type: "text",
    },
    {
      key: "newValidTo",
      label: "New Valid To",
      accessor: "newValidTo",
      type: "text",
    },
    {
      key: "revisionNo",
      label: "Revision No",
      accessor: "revisionNo",
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
    "amendmentNo",
    "amendmentDate",
    "plantName",
    "belongsTo",
    "partyId",
    "partyName",
    "contractNo",
    "contractDate",
    "newValidFrom",
    "newValidTo",
    "revisionNo",
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
      title="Supplier Rate Contract Amendment"
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
      emptyMessage="No Supplier Rate Contract Amendments found"
      loadingMessage="Loading Supplier Rate Contract Amendments..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SupplierRateContractAmendments"
    />
  );
};

export default SupplierRateContractAmendmentList;
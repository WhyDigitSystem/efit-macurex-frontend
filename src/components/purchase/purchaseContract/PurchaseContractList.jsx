import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { purchaseContractAPI } from "../../../api/Purchase/purchaseContractAPI";
import { toast } from "../../../utils/toast";

const PurchaseContractList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [contractData, setContractData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);

      const contracts = await purchaseContractAPI.getContractByOrgId(ORG_ID);

      contracts.sort((a, b) => (b.id || 0) - (a.id || 0));

      setContractData(contracts);
    } catch (error) {
      console.error("Failed to load purchase contracts:", error);
      setContractData([]);
      toast.error("Failed to fetch Purchase Contracts");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts, refreshTrigger]);

  const columns = [
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
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
      key: "supplierCode",
      label: "Supplier Code",
      accessor: "supplierCode",
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: "supplierName",
      type: "text",
    },
    {
      key: "poType",
      label: "P.O Type",
      accessor: "poType",
      type: "text",
    },
    {
      key: "validFrom",
      label: "Valid From",
      accessor: "validFrom",
      type: "text",
    },
    {
      key: "validTo",
      label: "Valid To",
      accessor: "validTo",
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
    "contractNo",
    "plantId",
    "belongsTo",
    "department",
    "supplierCode",
    "supplierName",
    "poType",
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
      title="Purchase Contract (Open)"
      data={contractData}
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
      emptyMessage="No Purchase Contracts found"
      loadingMessage="Loading Purchase Contracts..."
      enableRefresh={true}
      onRefresh={loadContracts}
      enableExport={true}
      exportFileName="PurchaseContracts"
    />
  );
};

export default PurchaseContractList;

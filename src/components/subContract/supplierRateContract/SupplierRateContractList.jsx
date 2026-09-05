import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import supplierRateContractAPI from "../../../api/SubContract/supplierRateContractAPI";
import { useToast } from "../../Toast/ToastContext";

const SupplierRateContractList = ({
  onAddNew,
  onEdit,
  refreshTrigger,
  onBack,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      console.warn("Missing orgId or branchId");
      return;
    }

    try {
      setLoading(true);
      const response = await supplierRateContractAPI.getSupplierRateContractByOrgId(
        ORG_ID,
        BRANCH_ID
      );

      console.log("API Response:", response);

      // Extract the data from the response structure
      let data = [];
      if (response?.paramObjectsMap?.supplierRateContract) {
        data = response.paramObjectsMap.supplierRateContract;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response?.data?.paramObjectsMap?.supplierRateContract) {
        data = response.data.paramObjectsMap.supplierRateContract;
      }

      // Transform data for display
      const transformedData = data.map((item) => ({
        id: item.id,
        contractNo: item.docId || item.contractNo || "",
        contractDate: item.docDate || item.contractDate || "",
        plantId: item.branch?.branchName || item.plantId || "",
        department: item.department?.departmentName || item.department || "",
        vendorId: item.customer?.customerCode || item.vendorId || "",
        vendorName: item.customer?.customerName || item.vendorName || "",
        contractFor: item.contractFor || "",
        validFrom: item.validFrom || "",
        validTo: item.validTo || "",
        active: item.active === "Active" ? "Active" : "Inactive",
        // Keep the full object for edit
        _rawData: item,
      }));

      // Sort by ID descending (newest first)
      transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(transformedData);
    } catch (error) {
      console.error("Failed to load supplier rate contracts:", error);
      setRecords([]);
      addToast("Failed to fetch Supplier Rate Contracts", "error");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const handleEdit = (record) => {
    if (onEdit) {
      // Pass the raw data for editing
      onEdit(record._rawData || record);
    }
  };

  const columns = [
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
      key: "plantId",
      label: "Plant ID",
      accessor: "plantId",
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
      key: "contractFor",
      label: "Contract For",
      accessor: "contractFor",
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
    "contractDate",
    "plantId",
    "department",
    "vendorId",
    "vendorName",
    "contractFor",
    "validFrom",
    "validTo",
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
      title="Supplier Rate Contract"
      data={records}
      loading={loading}
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
      emptyMessage="No Supplier Rate Contracts found"
      loadingMessage="Loading Supplier Rate Contracts..."
      enableRefresh={true}
      onRefresh={loadRecords}
      enableExport={true}
      exportFileName="SupplierRateContracts"
    />
  );
};

export default SupplierRateContractList;
import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesContractAPI from "../../../api/Sales/salesContract";

const SalesContractList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));

  const loadItems = async () => {
    if (!orgId || !branchId) {
      console.log("Missing orgId or branchId");
      setItemData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await salesContractAPI.getSalesContracts(orgId, branchId);
      console.log("Sales Contract List Response:", response);

      if (response?.status && response?.paramObjectsMap?.salesContract) {
        const salesContracts = response.paramObjectsMap.salesContract;

        // Transform the data for display
        const transformedData = salesContracts.map(item => ({
          id: item.id,
          contractNo: item.customerContractNo || "-",
          contractDate: item.contractDate || "-",
          branchName: item.branch?.branchName || "-",
          belongsTo: item.belongsTo || "-",
          contractType: item.contractType || "-",
          withQuotation: item.withQuotation || "-",
          invoiceType: item.invoiceType || "-",
          customerName: item.customer?.customerName || "-",
          quotationNo: item.quotationNo || "-",
          quotationDate: item.quotationDate || "-",
          customerPoNo: item.customerPoNo || "-",
          customerPoDate: item.customerPoDate || "-",
          effectiveFrom: item.effectiveFrom || "-",
          effectiveTo: item.effectiveTo || "-",
          postRate: item.postRate || "-",
          totalAmount: item.totalAmount || 0,
          amountInWords: item.amountInWords || "-",
          paymentTerms: item.paymentTerms || "-",
          priceTerms: item.priceTerms || "-",
          terms: item.terms || "-",
          notes: item.notes || "-",
          status: item.active ? "Active" : "Inactive",
          active: item.active,
          // Store the full object for editing
          _raw: item,
        }));

        // Sort by id descending (newest first)
        transformedData.sort((a, b) => b.id - a.id);
        setItemData(transformedData);
      } else {
        setItemData([]);
      }
    } catch (error) {
      console.error("Error loading sales contracts:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [orgId, branchId]);

  const handleEdit = (item) => {
    console.log("Edit item:", item);
    // Pass the raw data for editing
    onEdit(item._raw || item);
  };

  const columns = [
    {
      key: "contractNo",
      label: "Contract No",
      accessor: "contractNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "contractDate",
      label: "Contract Date",
      accessor: "contractDate",
      type: "text",
    },
    {
      key: "branchName",
      label: "Branch",
      accessor: "branchName",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: "belongsTo",
      type: "text",
    },
    {
      key: "contractType",
      label: "Contract Type",
      accessor: "contractType",
      type: "text",
    },
    {
      key: "withQuotation",
      label: "With Quotation",
      accessor: "withQuotation",
      type: "text",
    },
    {
      key: "invoiceType",
      label: "Invoice Type",
      accessor: "invoiceType",
      type: "text",
    },
    {
      key: "quotationNo",
      label: "Quotation No",
      accessor: "quotationNo",
      type: "text",
    },
    {
      key: "customerPoNo",
      label: "Customer PO No",
      accessor: "customerPoNo",
      type: "text",
    },
    {
      key: "effectiveFrom",
      label: "Effective From",
      accessor: "effectiveFrom",
      type: "text",
    },
    {
      key: "effectiveTo",
      label: "Effective To",
      accessor: "effectiveTo",
      type: "text",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "currency",
      format: (value) => {
        if (!value) return "-";
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
    {
      key: "paymentTerms",
      label: "Payment Terms",
      accessor: "paymentTerms",
      type: "text",
    },
    {
      key: "status",
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

  const searchFields = [
    "contractNo",
    "customerName",
    "belongsTo",
    "contractType",
    "quotationNo",
    "customerPoNo",
    "branchName",
    "invoiceType",
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
      title="Sales Contract List"
      data={itemData}
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
      emptyMessage="No Sales Contracts found"
      loadingMessage="Loading Sales Contracts..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="SalesContracts"
    />
  );
};

export default SalesContractList;
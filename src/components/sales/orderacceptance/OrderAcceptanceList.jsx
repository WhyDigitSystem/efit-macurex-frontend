import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import orderAcceptanceAPI from "../../../api/Sales/orderAcceptanceAPI";

const OrderAcceptanceList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");
        setLoading(false);
        return;
      }

      const response = await orderAcceptanceAPI.getOrderAcceptances(orgId, branchId);
      console.log("Order Acceptance List Response:", response);

      if (response?.status && response?.paramObjectsMap?.orderAcceptanceResponseVO) {
        const data = response.paramObjectsMap.orderAcceptanceResponseVO;

        // Transform the data for the table
        const transformedData = data.map((item) => ({
          id: item.id,
          orderNo: item.orderNo || item.docId || `OA/${new Date().getFullYear()}/${String(item.id).padStart(6, "0")}`,
          docDate: item.docDate || item.orderDate || "",
          belongsTo: item.belongsTo || "",
          soType: item.soType || "",
          withQuotation: item.withQuotation || "",
          customerName: item.customerId?.customerName || "",
          customerId: item.customerId?.id || "",
          customerGstNo: item.customerId?.customerGstNo || "",
          gstApproval: item.customerId?.gstApproval || "",
          quotationNo: item.quotationNo || "",
          quotationDate: item.quotationDate || "",
          enquiryNo: item.enquiryNo || "",
          enquiryDate: item.enquiryDate || "",
          customerPurchaseOrderNo: item.customerPurchaseOrderNo || "",
          customerPurchaseOrderDate: item.customerPurchaseOrderDate || "",
          postRate: item.postRate || "",
          createdBy: item.createdBy || "",
          active: item.active !== false,
          cancel: item.cancel || false,
          updatedBy: item.updatedBy || "",
          cancelRemarks: item.cancelRemarks || "",
          branch: item.branch?.branchName || "",
          branchCode: item.branch?.branchCode || "",
          destination: item.destination || "",
          modeOfTransport: item.modeOfTransport || "",
          grossValue: item.grossalue || 0,
          freight: item.freight || "",
          deliveryTerms: item.deliveryTerms || "",
          paymentTerms: item.paymentTerms || "",
          specification: item.specification || "",
          note: item.note || "",
          financialYear: item.financialYear || "",
          orderAcceptanceDetails: item.orderAcceptanceDetailsResponseDTO || [],
          taxDetails: item.orderAcceptanceTaxDetailsResponsVO || [],
          attachments: item.orderAcceptanceFileUploadDetailsDTO || [],
        }));

        // Sort by id descending (newest first)
        transformedData.sort((a, b) => b.id - a.id);
        setItemData(transformedData);
      } else {
        setItemData([]);
      }
    } catch (error) {
      console.error("Error loading order acceptances:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    // Pass the full item data for editing
    onEdit(item);
  };

  const columns = [
    {
      key: "orderNo",
      label: "Order No",
      accessor: "orderNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "docDate",
      label: "Date",
      accessor: "docDate",
      type: "date",
    },
    {
      key: "customerName",
      label: "Customer",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "soType",
      label: "SO Type",
      accessor: "soType",
      type: "text",
    },
    {
      key: "withQuotation",
      label: "With Quotation",
      accessor: "withQuotation",
      type: "text",
    },
    {
      key: "quotationNo",
      label: "Quotation No",
      accessor: "quotationNo",
      type: "text",
    },
    {
      key: "enquiryNo",
      label: "Enquiry No",
      accessor: "enquiryNo",
      type: "text",
    },
    {
      key: "customerPurchaseOrderNo",
      label: "PO No",
      accessor: "customerPurchaseOrderNo",
      type: "text",
    },
    {
      key: "postRate",
      label: "Post Rate",
      accessor: "postRate",
      type: "text",
    },
    {
      key: "createdBy",
      label: "Created By",
      accessor: "createdBy",
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

  const searchFields = [
    "orderNo",
    "docDate",
    "customerName",
    "soType",
    "quotationNo",
    "enquiryNo",
    "customerPurchaseOrderNo",
    "createdBy",
    "belongsTo",
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
      title="Order Acceptance List"
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
      emptyMessage="No Order Acceptances found"
      loadingMessage="Loading Order Acceptances..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="OrderAcceptance"
    />
  );
};

export default OrderAcceptanceList;
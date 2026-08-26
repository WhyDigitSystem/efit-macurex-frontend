import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import quotationAPI from "../../../api/Sales/quotationAPI";
import { useToast } from "../../Toast/ToastContext";
import generateQuotationPDF from "../../../utils/generateQuotationPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const QuotationList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const { addToast } = useToast();
  const [pdfPreview, setPdfPreview] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await quotationAPI.getQuotations(orgId, branchId);
      console.log("Quotation List Response:", response);

      if (response) {
        const quotations = response.paramObjectsMap.quotationResponseVO;

        // Transform the data for the table display
        const transformedData = quotations.map(item => ({
          id: item.id,
          quotationNo: item.quotationSerialNo || item.id,
          quotationSerialNo: item.quotationSerialNo,
          date: item.docDate || item.date,
          withEnquiry: item.withEnquiry,
          enquiryNo: item.enquiryNo,
          enquiryDate: item.enquiryDate,
          partyName: item.customer?.customerName || "",
          branchName: item.branch?.branchName || "",
          amount: item.amount || 0,
          freight: item.freight || 0,
          totalAmount: item.totalAmount || (item.amount || 0) + (item.freight || 0),
          validTill: item.validTill,
          kindAttention: item.kindAttention,
          customerEnquiryNo: item.customerEnquiryNo,
          customerEnquiryDate: item.customerEnquiryDate,
          terms: item.terms,
          remarks: item.remarks,
          preparedBy: item.preparedBy,
          createdBy: item.createdBy,
          updatedBy: item.updatedBy,
          active: item.active,
          cancel: item.cancel,
          cancelRemarks: item.cancelRemarks,
          // Store the full object for editing
          _raw: item,
          // For displaying item count in the list
          itemCount: item.quotationItemDetailsResponseDTO?.length || 0,
          // For displaying the first item code
          firstItemCode: item.quotationItemDetailsResponseDTO?.[0]?.itemCodes || "",
        }));

        setItemData(transformedData);
      } else {
        setItemData([]);
      }
    } catch (error) {
      console.error("Error loading quotations:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    onEdit(item._raw || item);
  };

  const handleDownloadPDF = (row) => {
    try {
      const raw = row._raw || {};

      const items = (raw.quotationItemDetailsResponseDTO || []).map((item) => ({
        itemCode: item.itemCodes?.itemCode || item.itemCode || "",
        itemDescription: item.itemCodes?.itemDescription || item.itemDescription || "",
        unit: item.unit || "",
        qtyOffered: item.qtyOffered || 0,
        basicPrice: item.basicPrice || 0,
        discPercent: item.discountPercentage || 0,
        discountAmount: item.discountAmount || 0,
        quotAmount: item.quotationAmount || 0,
        qty: item.qtyOffered || 0,
        currencyName: item.currency?.currency || "",
        date: item.deliveryDate || "",
      }));

      const taxDetails = (raw.quotationItemTaxDetailsDTO || []).map((tax) => ({
        particulars: tax.particulars || "",
        amount: tax.amount || 0,
      }));

      const result = generateQuotationPDF({
        company: { name: row.branchName || "Company Name" },
        quotation: {
          plantId: row.branchName || "",
          quotationNo: row.quotationNo || "",
          serialNo: row.quotationSerialNo || "",
          date: row.date || "",
          withEnquiry: row.withEnquiry || "",
          enquiryNo: row.enquiryNo || "",
          enquiryDate: row.enquiryDate || "",
          validTill: row.validTill || "",
          kindAttention: raw.kindAttention || "",
          customerEnquiryNo: row.customerEnquiryNo || "",
          customerEnquiryDate: row.customerEnquiryDate || "",
          partyName: row.partyName || "",
          branchName: row.branchName || "",
          preparedBy: row.preparedBy || "",
          amount: row.amount || 0,
          freight: row.freight || 0,
          freightBy: raw.freightBy || "",
          totalAmount: row.totalAmount || 0,
          terms: raw.terms || "",
          remarks: raw.remarks || "",
        },
        items,
        taxDetails,
      });

      if (result && result.blobUrl) {
        setPdfPreview(result);
      } else {
        addToast("Failed to generate PDF preview", "error");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      addToast("Failed to generate PDF: " + error.message, "error");
    }
  };

  // Define columns for the table
  const columns = [
    {
      key: "quotationNo",
      label: "Quotation No",
      accessor: "quotationNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "quotationSerialNo",
      label: "Serial No",
      accessor: "quotationSerialNo",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "date",
    },
    {
      key: "partyName",
      label: "Customer",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "branchName",
      label: "Branch",
      accessor: "branchName",
      type: "text",
    },
    {
      key: "withEnquiry",
      label: "With Enquiry",
      accessor: "withEnquiry",
      type: "text",
    },
    {
      key: "enquiryNo",
      label: "Enquiry No",
      accessor: "enquiryNo",
      type: "text",
    },
    {
      key: "itemCount",
      label: "Items",
      accessor: "itemCount",
      type: "text",
    },
    {
      key: "freight",
      label: "Freight",
      accessor: "freight",
      type: "currency",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: "totalAmount",
      type: "currency",
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
    "quotationNo",
    "quotationSerialNo",
    "partyName",
    "enquiryNo",
    "customerEnquiryNo",
    "branchName",
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
    {
      value: "withEnquiry",
      label: "With Enquiry",
      field: "withEnquiry",
      filterValue: "YES",
      activeValue: "YES",
    },
    {
      value: "withoutEnquiry",
      label: "Without Enquiry",
      field: "withEnquiry",
      filterValue: "NO",
      activeValue: "NO",
    },
  ];

  return (
    <>
    <CommonListViewTable
      title="Quotation List"
      data={itemData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onDownload={handleDownloadPDF}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No quotations found"
      loadingMessage="Loading quotations..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="Quotations"
    />

      {pdfPreview && (
        <PDFPreviewModal
          blobUrl={pdfPreview.blobUrl}
          fileName={pdfPreview.fileName}
          onClose={() => {
            if (pdfPreview.blobUrl) URL.revokeObjectURL(pdfPreview.blobUrl);
            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default QuotationList;
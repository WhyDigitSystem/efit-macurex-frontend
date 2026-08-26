import React, { useEffect, useState, useCallback } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import enquiryAPI from "../../../api/Sales/enquiryAPI";
import generateEnquiryReportPDF from "../../../utils/generateEnquiryReportPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";
import { useToast } from "../../Toast/ToastContext";

const EnquiryList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const { addToast } = useToast();

  const loadItems = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");
        setItemData([]);
        setLoading(false);
        return;
      }

      const response = await enquiryAPI.getEnquiryByOrgId(orgId, branchId);

      let enquiries = [];
      if (response?.paramObjectsMap?.enquiryList) {
        enquiries = response.paramObjectsMap.enquiryList;
      } else if (Array.isArray(response)) {
        enquiries = response;
      }

      const transformedData = enquiries.map((enquiry) => ({
        id: enquiry.id,
        enquiryNo: enquiry.enquiryNo || "",
        enquiryType: enquiry.enquiryType || "",
        enquiryDate: enquiry.enquiryDate || "",
        branchName: enquiry.branch?.branchName || "",
        branchCode: enquiry.branch?.branchCode || "",
        partyName: enquiry.partyName || "",
        partyRefNo: enquiry.partyRefNo || "",
        partyRefDate: enquiry.partyRefDate || "",
        enquiryDueDate: enquiry.enquiryDueDate || "",
        contactName: enquiry.contactName?.employeeName || "",
        contactEmail: enquiry.contactEmail || "",
        status: enquiry.status || "",
        active: enquiry.active === "Active",
        createdBy: enquiry.createdBy || "",
        orgId: enquiry.orgId || "",
        cancelRemarks: enquiry.cancelRemarks || "",
        plantId: enquiry.branch?.branchName || "",
        enquiryDetails: enquiry.enquiryDetails || [],
        enquiryTermsandCond: enquiry.enquiryTermsandCond || [],
        enquiryAttachmentDTO: enquiry.enquiryAttachmentDTO || [],
      }));

      transformedData.sort((a, b) => b.id - a.id);
      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading enquiries:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const handleDownloadPDF = (row) => {
    try {
      const items = (row.enquiryDetails || []).map((detail) => ({
        contactPartNo: detail.itemCode || "",
        itemDescription: detail.itemDescription || "",
        annualQty: detail.annualquantity || 0,
        dlryDate: detail.dlrydate || "",
        needApproval: detail.needrdapproval || "",
        quoteDueDate: detail.quoteduedate || "",
        remarks: detail.remarks || "",
      }));

      const termsData = (row.enquiryTermsandCond || [])[0] || {};

      const result = generateEnquiryReportPDF({
        company: {
          name: row.branchName || "Company Name",
        },
        enquiry: {
          plantId: row.plantId || "",
          enquiryType: row.enquiryType || "",
          enquiryNo: row.enquiryNo || "",
          enquiryDate: row.enquiryDate || "",
          partyId: row.partyName || "",
          partyName: row.partyName || "",
          partyRefNo: row.partyRefNo || "",
          partyRefDate: row.partyRefDate || "",
          enquiryDueDate: row.enquiryDueDate || "",
          contactName: row.contactName || "",
        },
        items,
        terms: {
          additionalInvestment: termsData.additionalInvestment || "",
          additionalManPower: termsData.additionalManPower || "",
          timeFrame: termsData.likelyTimeFrame || "",
          expectedTime: termsData.expectedDeliverySample || "",
          pilotBatch: termsData.pilotBatch || "",
          regularProduction: termsData.regularProduction || "",
          reviewComments: termsData.initialReviewComments || "",
          detailReview: termsData.detailDelivery || "",
          statutory: termsData.statutoryRegulatoryReq || "",
          followUp: termsData.followUp || "",
          remarks: termsData.remarks || "",
          conclusion: termsData.conclusion || "",
        },
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

  const columns = [
    {
      key: "enquiryNo",
      label: "Enquiry No",
      accessor: "enquiryNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "enquiryType",
      label: "Enquiry Type",
      accessor: "enquiryType",
      type: "text",
    },
    {
      key: "enquiryDate",
      label: "Enquiry Date",
      accessor: "enquiryDate",
      type: "date",
    },
    {
      key: "branchCode",
      label: "Branch",
      accessor: "branchCode",
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "partyRefNo",
      label: "Party Ref No",
      accessor: "partyRefNo",
      type: "text",
    },
    {
      key: "enquiryDueDate",
      label: "Due Date",
      accessor: "enquiryDueDate",
      type: "date",
    },
    {
      key: "contactName",
      label: "Contact",
      accessor: "contactName",
      type: "text",
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
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
      width: "110px",
    },
  ];

  const searchFields = [
    "enquiryNo",
    "enquiryType",
    "branchCode",
    "branchName",
    "partyName",
    "partyRefNo",
    "contactName",
    "contactEmail",
    "status",
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
    <>
      <CommonListViewTable
        title="Enquiry Report"
        subtitle="Sales - Manage enquiries and download reports"
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
        emptyMessage="No Enquiries found"
        loadingMessage="Loading Enquiries..."
        enableRefresh={true}
        onRefresh={loadItems}
        enableExport={true}
        exportFileName="Enquiries"
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

export default EnquiryList;
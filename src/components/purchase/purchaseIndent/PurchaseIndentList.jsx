import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import purchaseIndentAPI from "../../../api/Purchase/purchaseIndentAPI";
import { toast } from "../../../utils/toast";
import generatePurchaseIndentPDF from "../../../utils/generatePurchaseIndentPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const PurchaseIndentList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

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

      const response = await purchaseIndentAPI.getPurchaseIndentByOrgId(
        orgId,
        branchId,
      );

      console.log("API Response:", response);

      // Extract the purchase indent list from the response
      let indents = [];
      if (response?.paramObjectsMap?.purchaseIndentResponseVO) {
        indents = response.paramObjectsMap.purchaseIndentResponseVO;
      } else if (Array.isArray(response)) {
        indents = response;
      }

      // Transform the data for the table - backend DTO is flat, so branch/
      // department/preparedBy/byWhom may come back either as plain ids or as
      // nested objects depending on your service layer; handle both.
      const transformedData = indents.map((indent) => ({
        id: indent.id,
        indentNo: indent.indentNo || indent.id,
        belongsTo: indent.belongsTo || "",
        branch: indent.branch?.branchName || indent.branch || "",
        branchCode: indent.branch?.branchCode || "",
        department:
          indent.department?.departmentName || indent.department || "",
        preparedBy: indent.preparedBy?.employeeName || indent.preparedBy || "",
        byWhom: indent.byWhom?.employeeName || indent.byWhom || "",
        indentDate: indent.indentDate || "",
        remarks: indent.remarks || "",
        cancelRemarks: indent.cancelRemarks || "",
        approved: Boolean(indent.approved),
        active: Boolean(indent.active),
        createdBy: indent.createdBy || "",
        orgId: indent.orgId || "",
        details: indent.details || [],
        attachments: indent.attachments || [],
      }));

      // Sort by id descending (newest first)
      transformedData.sort((a, b) => b.id - a.id);

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading purchase indents:", error);
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
      // NOTE: detail rows on the list record only carry item/unit IDs
      // (see PurchaseIndentForm's detail shape) unless your API already
      // resolves them to nested objects. Adjust the fallbacks below to
      // match whatever shape purchaseIndentAPI.getPurchaseIndentByOrgId
      // actually returns for `details`.
      const items = (row.details || []).map((detail) => ({
        itemCode:
          detail.item?.itemCode || detail.itemCode || String(detail.item ?? ""),
        itemDescription:
          detail.itemDescription || detail.item?.itemDescription || "",
        primaryUnitLabel:
          detail.primaryUnitLabel || detail.primaryUnit?.primaryUnit || "",
        purchaseUnitLabel:
          detail.purchaseUnitLabel || detail.purchaseUnit?.primaryUnit || "",
        qtyInPrimaryUnit: detail.qtyInPrimaryUnit || 0,
        conversionFactor: detail.conversionFactor || 0,
        qtyInPurchaseUnit: detail.qtyInPurchaseUnit || 0,
        requiredDate: detail.requiredDate || "",
        purpose: detail.purpose || "",
      }));

      const result = generatePurchaseIndentPDF({
        company: { name: row.branch || "Company Name" },
        indent: {
          id: row.id,
          indentNo: row.indentNo || row.id,
          plantId: row.branch || "",
          belongsTo: row.belongsTo || "",
          indentDate: row.indentDate || "",
          department: row.department || "",
          preparedBy: row.preparedBy || "",
          byWhom: row.byWhom || "",
          approved: row.approved,
          active: row.active,
          remarks: row.remarks || "",
          cancelRemarks: row.cancelRemarks || "",
        },
        items,
      });

      if (result && result.blobUrl) {
        setPdfPreview(result);
      } else {
        toast.error("Failed to generate PDF preview");
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF: " + error.message);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Indent",
      accessor: "id",
      type: "text",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Plant",
      accessor: "branch",
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
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
      type: "text",
    },
    {
      key: "remarks",
      label: "Remarks",
      accessor: "remarks",
      type: "text",
    },
    {
      key: "approved",
      label: "Approved",
      accessor: "approved",
      type: "status",
      statusVariants: {
        true: {
          label: "Approved",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        false: {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
        },
      },
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
    "branch",
    "belongsTo",
    "department",
    "preparedBy",
    "remarks",
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
      activeValue: true,
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: "inactive",
      activeValue: true,
    },
  ];

  return (
    <>
      <CommonListViewTable
        title="Purchase Indent"
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
        emptyMessage="No Purchase Indents found"
        loadingMessage="Loading Purchase Indents..."
        enableRefresh={true}
        onRefresh={loadItems}
        enableExport={true}
        exportFileName="PurchaseIndents"
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

export default PurchaseIndentList;

import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import excelPurchaseOrderAPI from "../../../api/Purchase/excelPurchaseOrderAPI";
import { toast } from "../../../utils/toast";
import generateExcelPurchaseOrderPDF from "../../../utils/generateExcelPurchaseOrderPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const ExcelPurchaseOrderList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

  const ORG_ID = localStorage.getItem("orgId");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const orders = await excelPurchaseOrderAPI.getByOrgId(ORG_ID);

      orders.sort((a, b) => (b.id || 0) - (a.id || 0));

      setOrderData(orders);
    } catch (error) {
      console.error("Failed to load excel purchase orders:", error);
      setOrderData([]);
      toast.error("Failed to fetch Excel Purchase Orders");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, refreshTrigger]);

  const handleDownloadPDF = (row) => {
    try {
      // The saved record mirrors the form's save payload shape:
      // { header, itemDetails, taxDetails, terms }. Fall back to flat
      // top-level fields in case the API ever returns it unwrapped.
      const header = row.header || row;
      const itemSource = row.itemDetails || row.items || [];
      const taxSource = row.taxDetails || [];
      const termsSource = row.terms || {};

      const items = itemSource.map((item) => ({
        itemDescription: item.itemDescription || "",
        hsnSacCode: item.hsnSacCode || "",
        taxType: item.taxType || "",
        taxPercent: item.taxPercent || 0,
        qty: item.qty || 0,
        purchaseUnit: item.purchaseUnit || "",
        rate: item.rate || 0,
        amount: item.amount || 0,
        sgstRate: item.sgstRate || 0,
        sgstAmount: item.sgstAmount || 0,
        cgstRate: item.cgstRate || 0,
        cgstAmount: item.cgstAmount || 0,
        igstRate: item.igstRate || 0,
        igstAmount: item.igstAmount || 0,
      }));

      const taxDetails = taxSource.map((tax) => ({
        particulars: tax.particulars || "",
        taxPercent: tax.taxPercent || 0,
        taxAmount: tax.taxAmount || 0,
      }));

      const result = generateExcelPurchaseOrderPDF({
        company: { name: header.plantId || "Company Name" },
        header: {
          plantId: header.plantId || "",
          department: header.department || "",
          belongsTo: header.belongsTo || "",
          supplierCode: header.supplierCode || "",
          supplierName: header.supplierName || "",
          taxCode: header.taxCode || "",
          gstState: header.gstState || "",
          isIgstApplicable: header.isIgstApplicable || false,
          gstnNo: header.gstnNo || "",
          refNo: header.refNo || "",
          refDate: header.refDate || "",
          poNo: header.poNo || "",
          poDate: header.poDate || "",
          address: header.address || "",
        },
        items,
        taxDetails,
        terms: {
          discount: termsSource.discount || 0,
          paymentTerms: termsSource.paymentTerms || "",
          totalAmount: termsSource.totalAmount || 0,
          deliveryTerms: termsSource.deliveryTerms || "",
          freight: termsSource.freight || 0,
          freightType: termsSource.freightType || "",
          packingType: termsSource.packingType || "",
          insurance: termsSource.insurance || "",
          modeOfDespatch: termsSource.modeOfDespatch || "",
          inlandCharge: termsSource.inlandCharge || 0,
          preparedBy: termsSource.preparedBy || "",
          authorizedBy: termsSource.authorizedBy || "",
          narration: termsSource.narration || "",
        },
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
      key: "poNo",
      label: "P.O. No",
      accessor: (row) => row.header?.poNo || row.poNo,
      type: "text",
    },
    {
      key: "poDate",
      label: "P.O. Date",
      accessor: (row) => row.header?.poDate || row.poDate,
      type: "text",
    },
    {
      key: "plantId",
      label: "Plant ID",
      accessor: (row) => row.header?.plantId || row.plantId,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department || row.department,
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier ID",
      accessor: (row) => row.header?.supplierCode || row.supplierCode,
      type: "text",
    },
    {
      key: "supplierName",
      label: "Supplier Name",
      accessor: (row) => row.header?.supplierName || row.supplierName,
      type: "text",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      accessor: (row) => row.terms?.totalAmount || row.totalAmount,
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
    "header.poNo",
    "poNo",
    "header.supplierCode",
    "supplierCode",
    "header.supplierName",
    "supplierName",
    "header.department",
    "department",
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
        title="Excel Purchase Order"
        data={orderData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onDownload={handleDownloadPDF}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage="No Excel Purchase Orders found"
        loadingMessage="Loading Excel Purchase Orders..."
        enableRefresh={true}
        onRefresh={loadOrders}
        enableExport={true}
        exportFileName="ExcelPurchaseOrders"
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

export default ExcelPurchaseOrderList;

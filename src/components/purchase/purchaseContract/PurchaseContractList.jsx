import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { purchaseContractAPI } from "../../../api/Purchase/purchaseContractAPI";
import { toast } from "../../../utils/toast";
import generatePurchaseContractPDF from "../../../utils/generatePurchaseContractPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const PurchaseContractList = ({ onAddNew, onEdit, refreshTrigger, onBack }) => {
  const [contractData, setContractData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);

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

  const handleDownloadPDF = (row) => {
    try {
      // NOTE: adjust these source keys to match the actual nested field
      // names returned by purchaseContractAPI.getContractByOrgId for a
      // single contract (item rows / tax rows / charges summary object).
      const itemSource =
        row.itemDetails ||
        row.purchaseContractItemDetailsResponseDTO ||
        row.itemDetailsResponseDTO ||
        [];

      const taxSource =
        row.taxDetails ||
        row.purchaseContractTaxDetailsResponseDTO ||
        row.taxDetailsResponseDTO ||
        [];

      const chargesSource =
        row.chargesSummary || row.chargesSummaryResponseDTO || {};

      const items = itemSource.map((item) => ({
        itemCode: item.itemCode?.itemCode || item.itemCode || "",
        itemDescription: item.itemDescription || "",
        hsnSacCode: item.hsnSacCode || "",
        taxType: item.taxType || "",
        taxPercent: item.taxPercent || 0,
        unit: item.unit || "",
        rate: item.rate || 0,
        inCurrency: item.inCurrency || "",
        sgstRate: item.sgstRate || 0,
        sgstAmount: item.sgstAmount || 0,
        cgstRate: item.cgstRate || 0,
        cgstAmount: item.cgstAmount || 0,
        igstRate: item.igstRate || 0,
        igstAmount: item.igstAmount || 0,
        validFrom: item.validFrom || "",
        validTo: item.validTo || "",
      }));

      const taxDetails = taxSource.map((tax) => ({
        particular: tax.particular || "",
        taxPercent: tax.taxPercent || 0,
        amount: tax.amount || 0,
      }));

      const result = generatePurchaseContractPDF({
        company: { name: row.plantId || "Company Name" },
        contract: {
          plantId: row.plantId || "",
          belongsTo: row.belongsTo || "",
          contractNo: row.contractNo || "",
          department: row.department || "",
          date: row.date || "",
          supplierCode: row.supplierCode || "",
          supplierName: row.supplierName || "",
          supplierRefNo: row.supplierRefNo || "",
          refDate: row.refDate || "",
          gstState: row.gstState || "",
          validFrom: row.validFrom || "",
          validTo: row.validTo || "",
          isIgstAppl: row.isIgstAppl || "",
          poType: row.poType || "",
          gstnNo: row.gstnNo || "",
          currency: row.currency || "",
          taxDescription: row.taxDescription || "",
        },
        items,
        taxDetails,
        chargesSummary: {
          modeOfDespatch: chargesSource.modeOfDespatch || "",
          paymentTerms: chargesSource.paymentTerms || "",
          delivery: chargesSource.delivery || "",
          freightType: chargesSource.freightType || "",
          packingType: chargesSource.packingType || "",
          insuranceAmount: chargesSource.insuranceAmount || 0,
          bankAccounts: chargesSource.bankAccounts || "",
          swiftCode: chargesSource.swiftCode || "",
          checkedBy: chargesSource.checkedBy || "",
          preparedBy: chargesSource.preparedBy || "",
          authorisedBy: chargesSource.authorisedBy || "",
          freightForwarder: chargesSource.freightForwarder || "",
          notes: chargesSource.notes || "",
          termsConditions: chargesSource.termsConditions || "",
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
    <>
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
        onDownload={handleDownloadPDF}
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

export default PurchaseContractList;

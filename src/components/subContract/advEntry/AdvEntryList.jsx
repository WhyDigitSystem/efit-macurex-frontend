import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import advEntryAPI from "../../../api/advEntryAPI";
import { toast } from "../../../utils/toast";

import generateAdvEntryPDF from "../../../utils/generateAdvEntryPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const AdvEntryList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pdfPreview, setPdfPreview] = useState(null);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const data = await advEntryAPI.getAdvForStoresByOrgIdAndBranch(
        BRANCH_ID,
        ORG_ID,
      );

      const recordsArray = Array.isArray(data) ? data : [];

      recordsArray.sort((a, b) => (b?.id || 0) - (a?.id || 0));

      setRecords(recordsArray);
    } catch (error) {
      console.error("Failed to load ADV For Stores entries:", error);
      setRecords([]);
      toast.error("Failed to fetch ADV For Stores");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const handleDownloadPDF = (row) => {
    try {
      console.log("ADV PDF Row:", row);

      // advForStoresDetails is the current shape; keep fallbacks for safety.
      const details =
        row?.advForStoresDetails ||
        row?.advDetails ||
        row?.details ||
        row?.advDetail ||
        [];

      const items = Array.isArray(details)
        ? details.map((detail) => ({
          itemCode:
            detail?.item?.itemCode ||
            detail?.itemCode ||
            detail?.itemId ||
            "",
          itemDescription:
            detail?.item?.itemDescription ||
            detail?.itemDescription ||
            detail?.item?.description ||
            "",
          unit:
            detail?.unit?.id ||
            detail?.unit ||
            detail?.unitId ||
            "",
          unitLabel:
            detail?.unit?.unitId ||
            detail?.unitLabel ||
            detail?.unitName ||
            "",
          bomQty: detail?.bomQty ?? detail?.bomQuantity ?? 0,
          issueQty: detail?.issueQty ?? detail?.issueQuantity ?? 0,
        }))
        : [];

      // Prepared By is now an object: { id, employeeName }
      const preparedBy =
        row?.preparedBy?.employeeName ||
        row?.preparedBy ||
        row?.summary?.preparedBy ||
        row?.employeeName ||
        "";

      // Plant comes from branch in the new shape
      const plantName =
        row?.branch?.branchName ||
        row?.plantName ||
        row?.plant?.plantName ||
        row?.plantId ||
        "";

      // Customer nested object
      const partyName =
        row?.customer?.customerName ||
        row?.partyName ||
        row?.party?.customerName ||
        "";

      const partyId =
        row?.customer?.customerCode ||
        row?.customer?.customerId ||
        row?.partyId ||
        "";

      // Incoming part nested object
      const incomingPartNo =
        row?.incomingPartNo?.itemCode ||
        row?.incomingPartNo ||
        "";

      const partName =
        row?.incomingPartNo?.itemDescription ||
        row?.partName ||
        "";

      // BOM nested object
      const bomId = row?.bom?.docId || row?.bomId || "";

      const result = generateAdvEntryPDF({
        company: {
          name: row?.companyName || row?.organizationName || "Company Name",
        },
        adv: {
          id: row?.id,
          docNo: row?.docNo || row?.docId || row?.id || "",
          docDate: row?.docDate || "",
          plantId: row?.branch?.id || row?.plantId || "",
          plantName,
          belongsTo: row?.belongsTo || "",
          partyId,
          partyName,
          incomingPartNo,
          partName,
          bomId,
          time: row?.time || "",
          preparedBy,
          active: row?.active !== false,
          remarks: row?.remarks || row?.summary?.remarks || "",
          cancelRemarks: row?.cancelRemarks || "",
          approved: row?.approved,
        },
        items,
      });

      if (result && result.blobUrl) {
        setPdfPreview(result);
      } else {
        toast.error("Failed to generate PDF preview");
      }
    } catch (error) {
      console.error("ADV PDF generation failed:", error);
      toast.error(
        "Failed to generate PDF: " + (error?.message || "Unknown error"),
      );
    }
  };

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: (row) => row.docNo || row.docId || "",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: "docDate",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: (row) => row.branch?.branchName || "",
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
      accessor: (row) =>
        row.customer?.customerCode || row.customer?.customerId || "",
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: (row) => row.customer?.customerName || "",
      type: "text",
    },
    {
      key: "incomingPartNo",
      label: "Incoming Part No",
      accessor: (row) => row.incomingPartNo?.itemCode || "",
      type: "text",
    },
    {
      key: "partName",
      label: "Part Name",
      accessor: (row) => row.incomingPartNo?.itemDescription || "",
      type: "text",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: (row) => row.preparedBy?.employeeName || "",
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
    "docNo",
    "docId",
    "docDate",
    "belongsTo",
    "remarks",
    // Nested paths — CommonListViewTable should resolve them if it uses
    // lodash-style path lookups, otherwise these simply won't match.
    "customer.customerCode",
    "customer.customerName",
    "incomingPartNo.itemCode",
    "incomingPartNo.itemDescription",
    "preparedBy.employeeName",
    "branch.branchName",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
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
      activeValue: false,
    },
  ];

  return (
    <>
      <CommonListViewTable
        title="ADV For Stores"
        data={records}
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
        emptyMessage="No ADV Entries found"
        loadingMessage="Loading ADV Entries..."
        enableRefresh={true}
        onRefresh={loadRecords}
        enableExport={true}
        exportFileName="AdvForStores"
      />

      {pdfPreview && (
        <PDFPreviewModal
          blobUrl={pdfPreview.blobUrl}
          fileName={pdfPreview.fileName}
          onClose={() => {
            if (pdfPreview.blobUrl) {
              URL.revokeObjectURL(pdfPreview.blobUrl);
            }
            setPdfPreview(null);
          }}
        />
      )}
    </>
  );
};

export default AdvEntryList;
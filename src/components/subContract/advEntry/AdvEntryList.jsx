import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import advEntryAPI from "../../../api/advEntryAPI";
import { toast } from "../../../utils/toast";

import generateAdvEntryPDF from "../../../utils/generateAdvEntryPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const AdvEntryList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------- */
  /* PDF Preview                                                     */
  /* -------------------------------------------------------------- */

  const [pdfPreview, setPdfPreview] = useState(null);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  /* -------------------------------------------------------------- */
  /* Load Records                                                    */
  /* -------------------------------------------------------------- */

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const data = await advEntryAPI.getAdvByOrgId(ORG_ID, BRANCH_ID);

      const recordsArray = Array.isArray(data) ? data : [];

      recordsArray.sort((a, b) => (b?.id || 0) - (a?.id || 0));

      setRecords(recordsArray);
    } catch (error) {
      console.error("Failed to load ADV entries:", error);

      setRecords([]);

      toast.error("Failed to fetch ADV Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  /* -------------------------------------------------------------- */
  /* PDF DOWNLOAD / PREVIEW                                         */
  /* -------------------------------------------------------------- */

  const handleDownloadPDF = (row) => {
    try {
      console.log("ADV PDF Row:", row);

      /*
       * ADV details can come in different shapes depending
       * on the backend response.
       *
       * Support:
       *   row.advDetails
       *   row.details
       *   row.advDetail
       */

      const details = row?.advDetails || row?.details || row?.advDetail || [];

      const items = Array.isArray(details)
        ? details.map((detail) => ({
            itemCode:
              detail?.itemCode ||
              detail?.item?.itemCode ||
              detail?.itemId ||
              "",

            itemDescription:
              detail?.itemDescription ||
              detail?.item?.itemDescription ||
              detail?.item?.description ||
              "",

            unit:
              detail?.unit || detail?.unitId || detail?.primaryUnit?.id || "",

            unitLabel:
              detail?.unitLabel ||
              detail?.unitName ||
              detail?.unit?.unitId ||
              detail?.primaryUnit?.unitId ||
              "",

            bomQty: detail?.bomQty ?? detail?.bomQuantity ?? 0,

            issueQty: detail?.issueQty ?? detail?.issueQuantity ?? 0,
          }))
        : [];

      /*
       * Prepared By can be returned from backend as:
       *
       *   preparedBy
       *   summary.preparedBy
       *   employeeName
       */

      const preparedBy =
        row?.preparedBy || row?.summary?.preparedBy || row?.employeeName || "";

      /*
       * Plant can be returned as:
       *
       *   plantName
       *   plantId
       *   plant object
       */

      const plantName =
        row?.plantName ||
        row?.plant?.plantName ||
        row?.plant?.branchName ||
        row?.plantId ||
        row?.branch?.branchName ||
        row?.branch ||
        "";

      const result = generateAdvEntryPDF({
        company: {
          name: row?.companyName || row?.organizationName || "Company Name",
        },

        adv: {
          id: row?.id,

          docNo: row?.docNo || row?.advNo || row?.id || "",

          docDate: row?.docDate || "",

          plantId: row?.plantId || row?.plant?.id || "",

          plantName,

          belongsTo: row?.belongsTo || "",

          partyId: row?.partyId || row?.party?.id || "",

          partyName:
            row?.partyName ||
            row?.party?.customerName ||
            row?.party?.partyName ||
            "",

          incomingPartNo: row?.incomingPartNo || "",

          partName: row?.partName || "",

          bomId: row?.bomId || "",

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

  /* -------------------------------------------------------------- */
  /* Columns                                                         */
  /* -------------------------------------------------------------- */

  const columns = [
    {
      key: "docNo",
      label: "Doc No",
      accessor: "docNo",
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
      accessor: "plantName",
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
      accessor: "partyId",
      type: "text",
    },

    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },

    {
      key: "incomingPartNo",
      label: "Incoming Part No",
      accessor: "incomingPartNo",
      type: "text",
    },

    {
      key: "partName",
      label: "Part Name",
      accessor: "partName",
      type: "text",
    },

    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: "preparedBy",
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

  /* -------------------------------------------------------------- */
  /* Search Fields                                                   */
  /* -------------------------------------------------------------- */

  const searchFields = [
    "docNo",
    "docDate",
    "plantName",
    "belongsTo",
    "partyId",
    "partyName",
    "incomingPartNo",
    "partName",
    "preparedBy",
  ];

  /* -------------------------------------------------------------- */
  /* Filters                                                         */
  /* -------------------------------------------------------------- */

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
      activeValue: false,
    },
  ];

  /* -------------------------------------------------------------- */
  /* Render                                                           */
  /* -------------------------------------------------------------- */

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
        /* PDF */
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
        exportFileName="AdvEntries"
      />

      {/* ---------------------------------------------------------- */}
      {/* PDF Preview Modal                                            */}
      {/* ---------------------------------------------------------- */}

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

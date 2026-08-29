import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

import generateMachineToolRectificationPDF from "../../../utils/generateMachineToolRectificationPDF";
import PDFPreviewModal from "../../../utils/PDFPreviewModal";

const MachineToolRectificationList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [rectificationData, setRectificationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pdfPreview, setPdfPreview] = useState(null);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  /* ================================================================ */
  /* LOAD DATA                                                         */
  /* ================================================================ */

  const loadRectifications = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await machineToolRectificationAPI.getMachineToolRectificationByOrgId(
          ORG_ID,
        );

      const sortedData = (response || []).sort(
        (a, b) => (b?.id || 0) - (a?.id || 0),
      );

      setRectificationData(sortedData);
    } catch (error) {
      console.error("Failed to load machine/tool rectifications:", error);

      setRectificationData([]);

      toast.error("Failed to fetch machine/tool rectifications");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadRectifications();
  }, [loadRectifications, refreshTrigger]);

  /* ================================================================ */
  /* DOWNLOAD / PREVIEW PDF                                           */
  /* ================================================================ */

  const handleDownloadPDF = (row) => {
    try {
      console.log("Machine/Tool Rectification PDF Row:", row);

      const header = row?.header || {};

      const result = generateMachineToolRectificationPDF({
        company: {
          name: row?.companyName || row?.organizationName || "Company Name",
        },

        rectification: {
          id: row?.id,

          header: {
            plant: header?.plant || row?.plant || "",

            docNo: header?.docNo || row?.docNo || "",

            department: header?.department || row?.department || "",

            date: header?.date || row?.date || "",

            breakdownNo: header?.breakdownNo || row?.breakdownNo || "",

            breakdownDate: header?.breakdownDate || row?.breakdownDate || "",

            attendBy: header?.attendBy || row?.attendBy || "",

            time: header?.time || row?.time || "",

            rectifiedOn: header?.rectifiedOn || row?.rectifiedOn || "",

            machineToolNo: header?.machineToolNo || row?.machineToolNo || "",

            rectificationTime:
              header?.rectificationTime || row?.rectificationTime || "",

            description: header?.description || row?.description || "",

            cause: header?.cause || row?.cause || "",

            maintenanceType:
              header?.maintenanceType || row?.maintenanceType || "",

            actionTaken: header?.actionTaken || row?.actionTaken || "",

            natureOfProblem:
              header?.natureOfProblem || row?.natureOfProblem || "",

            carriedOutBy: header?.carriedOutBy || row?.carriedOutBy || "",

            timeTakenForRectification:
              header?.timeTakenForRectification ||
              row?.timeTakenForRectification ||
              "",

            sparesUsed: header?.sparesUsed || row?.sparesUsed || "",

            location: header?.location || row?.location || "",

            preparedBy: header?.preparedBy || row?.preparedBy || "",

            remarks: header?.remarks || row?.remarks || "",

            approvedBy: header?.approvedBy || row?.approvedBy || "",
          },

          active: row?.active !== false,
        },
      });

      if (result && result.blobUrl) {
        setPdfPreview(result);
      } else {
        toast.error("Failed to generate PDF preview");
      }
    } catch (error) {
      console.error("Machine/Tool Rectification PDF generation failed:", error);

      toast.error(
        "Failed to generate PDF: " + (error?.message || "Unknown error"),
      );
    }
  };

  /* ================================================================ */
  /* COLUMNS                                                           */
  /* ================================================================ */

  const columns = [
    {
      key: "docNo",
      label: "Doc No.",
      accessor: (row) => row.header?.docNo,
      type: "text",
    },

    {
      key: "date",
      label: "Date",
      accessor: (row) => row.header?.date,
      type: "date",
    },

    {
      key: "plant",
      label: "Plant ID",
      accessor: (row) => row.header?.plant,
      type: "text",
    },

    {
      key: "department",
      label: "Department",
      accessor: (row) => row.header?.department,
      type: "text",
    },

    {
      key: "machineToolNo",
      label: "Machine No. / Tool No.",
      accessor: (row) => row.header?.machineToolNo,
      type: "text",
    },

    {
      key: "maintenanceType",
      label: "Maintenance Type",
      accessor: (row) => row.header?.maintenanceType,
      type: "badge",
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

  /* ================================================================ */
  /* SEARCH                                                            */
  /* ================================================================ */

  const searchFields = [
    "header.docNo",
    "header.machineToolNo",
    "header.breakdownNo",
    "header.department",
    "header.plant",
    "header.maintenanceType",
  ];

  /* ================================================================ */
  /* FILTERS                                                           */
  /* ================================================================ */

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

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */

  return (
    <>
      <div className="h-full flex flex-col">
        <CommonListViewTable
          title="Machine/Tool Rectification"
          data={rectificationData}
          loading={loading}
          columns={columns}
          searchFields={searchFields}
          filterOptions={filterOptions}
          defaultFilter="all"
          onBack={onBack}
          onAddNew={onAddNew}
          onEdit={onEdit}
          /* PDF DOWNLOAD */
          onDownload={handleDownloadPDF}
          onView={false}
          showSerialNumber={true}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
          defaultItemsPerPage={10}
          emptyMessage="No Machine/Tool Rectifications found"
          loadingMessage="Loading Machine/Tool Rectifications..."
          enableRefresh={true}
          onRefresh={loadRectifications}
          enableExport={true}
          exportFileName="MachineToolRectifications"
        />
      </div>

      {/* ============================================================ */}
      {/* PDF PREVIEW MODAL                                             */}
      {/* ============================================================ */}

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

export default MachineToolRectificationList;

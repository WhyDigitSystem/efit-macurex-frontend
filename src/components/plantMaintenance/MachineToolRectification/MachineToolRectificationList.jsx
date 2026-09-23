import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

import machineToolRectificationAPI from "../../../api/machineToolRectificationAPI";
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
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  /* ================================================================ */
  /* LOAD DATA                                                         */
  /* getMachineToolRectificationByOrgId requires BOTH branch and orgId  */
  /* (same requirement confirmed on Internal Indent) - branch is read   */
  /* from localStorage the same way orgId is.                          */
  /* ================================================================ */

  const loadRectifications = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return;

    try {
      setLoading(true);

      const response = await machineToolRectificationAPI.getByOrgId(
        BRANCH_ID,
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
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRectifications();
  }, [loadRectifications, refreshTrigger]);

  /* ================================================================ */
  /* DOWNLOAD / PREVIEW PDF                                           */
  /* Response rows are flat (branch/department/attendBy/etc. as        */
  /* nested objects) - NOT wrapped under a "header" key.                */
  /* ================================================================ */

  const handleDownloadPDF = (row) => {
    try {
      const result = generateMachineToolRectificationPDF({
        company: {
          name: row?.companyName || row?.organizationName || "Company Name",
        },

        rectification: {
          id: row?.id,

          header: {
            plant: row?.branch?.branchName || "",
            department: row?.department?.departmentName || "",
            date: row?.commonDate?.createdon || "",
            breakdownNo: row?.breakdownNo || "",
            breakdownDate: row?.breakdownDate || "",
            attendBy: row?.attendBy?.employeeName || "",
            time: row?.time || "",
            rectificationTime: row?.rectificationTime || "",
            machineToolNo: row?.machineToolNo || "",
            description: row?.description || "",
            cause: row?.cause || "",
            maintenanceType: row?.maintenanceType || "",
            actionTaken: row?.actionTaken || "",
            natureOfProblem: row?.natureOfProblem || "",
            carriedOutBy: row?.carriedOutBy?.employeeName || "",
            timeTakenForRectification: row?.timeTakenForRectification || "",
            sparesUsed: row?.sparesUsed || "",
            location: row?.location || "",
            preparedBy: row?.preparedBy?.employeeName || "",
            remarks: row?.remarks || "",
            approvedBy: row?.approvedBy?.employeeName || "",
          },

          active: row?.active === "Active" || row?.active === true,
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
  /* No doc-number field exists in the confirmed API response, so the  */
  /* Breakdown No. is used as the row identifier instead.               */
  /* ================================================================ */

  const columns = [
    {
      key: "breakdownNo",
      label: "Breakdown No.",
      accessor: "breakdownNo",
      type: "text",
    },

    {
      key: "breakdownDate",
      label: "Breakdown Date",
      accessor: "breakdownDate",
      type: "date",
    },

    {
      key: "plant",
      label: "Plant ID",
      accessor: (row) => row.branch?.branchName,
      type: "text",
    },

    {
      key: "department",
      label: "Department",
      accessor: (row) => row.department?.departmentName,
      type: "text",
    },

    {
      key: "machineToolNo",
      label: "Machine No. / Tool No.",
      accessor: "machineToolNo",
      type: "text",
    },

    {
      key: "maintenanceType",
      label: "Maintenance Type",
      accessor: "maintenanceType",
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
    "breakdownNo",
    "machineToolNo",
    "department.departmentName",
    "branch.branchName",
    "maintenanceType",
  ];

  /* ================================================================ */
  /* FILTERS                                                           */
  /* ================================================================ */

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

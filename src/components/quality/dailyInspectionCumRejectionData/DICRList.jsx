import { useCallback, useEffect, useState } from "react";

import CommonListViewTable from "../../../utils/CommonListViewTable";
import dailyInspectionCumRejectionDataAPI from "../../../api/quality/dailyInspectionCumRejectionDataAPI";
import { toast } from "../../../utils/toast";

const DICRList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);

      const data = await dailyInspectionCumRejectionDataAPI.getDICRByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const sortedData = Array.isArray(data)
        ? [...data].sort((a, b) => (b?.id || 0) - (a?.id || 0))
        : [];

      setRecords(sortedData);
    } catch (error) {
      setRecords([]);
      toast.error("Failed to fetch Daily Inspection Cum Rejection Data");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "docId",
      label: "DICR No",
      accessor: (row) => row?.docId || "",
      type: "text",
      noWrap: true,
    },

    {
      key: "docDate",
      label: "Date",
      accessor: (row) => row?.docDate || "",
      type: "text",
      noWrap: true,
    },

    {
      key: "branch",
      label: "Plant",
      accessor: (row) => row?.branch?.branchName || "",
      type: "text",
      noWrap: true,
    },

    {
      key: "belongsTo",
      label: "Belongs To",
      accessor: (row) => row?.belongsTo?.description || "",
      type: "text",
    },

    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: (row) => row?.preparedBy?.employeeName || "",
      type: "text",
    },

    {
      key: "reworkLocation",
      label: "Rework Location",
      accessor: (row) => row?.reworkLocation?.locationName || "",
      type: "text",
    },

    {
      key: "rejectionLocation",
      label: "Rejection Location",
      accessor: (row) => row?.rejectionLocation?.locationName || "",
      type: "text",
    },

    {
      key: "scrapLocation",
      label: "Scrap Location",
      accessor: (row) => row?.scrapLocation?.locationName || "",
      type: "text",
    },

    {
      key: "toLocation",
      label: "To Location",
      accessor: (row) => row?.toLocation?.locationName || "",
      type: "text",
    },

    {
      key: "active",
      label: "Status",
      accessor: (row) => row?.active || "",
      type: "text",
      noWrap: true,
    },

    {
      key: "financialYear",
      label: "Financial Year",
      accessor: (row) => row?.financialYear || "",
      type: "text",
      noWrap: true,
    },

    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "120px",
    },
  ];

  const searchFields = [
    "docId",
    "docDate",
    "branch",
    "belongsTo",
    "preparedBy",
    "fromLocation",
    "reworkLocation",
    "rejectionLocation",
    "scrapLocation",
    "toLocation",
    "active",
    "financialYear",
  ];

  return (
    <CommonListViewTable
      title="Daily Inspection Cum Rejection Data"
      data={records}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Daily Inspection Cum Rejection Data found"
      loadingMessage="Loading Daily Inspection Cum Rejection Data..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default DICRList;

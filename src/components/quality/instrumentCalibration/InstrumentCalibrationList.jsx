import { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import instrumentCalibrationAPI from "../../../api/quality/instrumentCalibrationAPI";
import { toast } from "../../../utils/toast";

const InstrumentCalibrationList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await instrumentCalibrationAPI.getInstrumentCalibrationByOrgId(
        ORG_ID,
        BRANCH_ID,
      );
      data.sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch instrument calibrations:", error);
      setRecords([]);
      toast.error("Failed to fetch Instrument Calibration Entries");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  const columns = [
    {
      key: "reportNo",
      label: "Report No",
      accessor: (row) => row.reportNo,
      type: "text",
      noWrap: true,
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.plantId === "object"
          ? row.plantId.branchName || row.plantId.plantName || row.plantId.id
          : row.plantName || row.plantId,
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) =>
        typeof row.department === "object"
          ? row.department.departmentName || row.department.id
          : row.department || "",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: (row) => row.date || "",
      type: "text",
    },
    {
      key: "machineInstrumentNo",
      label: "Machine/Instr No",
      accessor: (row) => row.machineInstrumentNo || row.machineNo || "",
      type: "text",
    },
    {
      key: "certificateNo",
      label: "Certificate No",
      accessor: (row) => row.certificateNo || "",
      type: "text",
    },
    {
      key: "overallCalibrationStatus",
      label: "Calibration Status",
      accessor: (row) =>
        typeof row.overallCalibrationStatus === "object"
          ? row.overallCalibrationStatus.valuesDescription ||
            row.overallCalibrationStatus.label ||
            row.overallCalibrationStatus.id
          : row.overallCalibrationStatus || "",
      type: "text",
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
    "reportNo",
    "plantId",
    "department",
    "machineInstrumentNo",
    "certificateNo",
  ];

  return (
    <CommonListViewTable
      title="Instrument Calibration"
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
      emptyMessage="No Instrument Calibration Entries found"
      loadingMessage="Loading Instrument Calibration Entries..."
      enableRefresh={true}
      onRefresh={loadRecords}
    />
  );
};

export default InstrumentCalibrationList;
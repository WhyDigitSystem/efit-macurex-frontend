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
        BRANCH_ID,
        ORG_ID,
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
      key: "id",
      label: "Id",
      accessor: (row) => row.id,
      type: "text",
      noWrap: true,
    },
    {
      key: "plantId",
      label: "Plant",
      accessor: (row) =>
        typeof row.branch === "object"
          ? row.branch.branchName || row.branch.id
          : row.branch || row.plantName || "",
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
      key: "selectMachineInstNo",
      label: "Machine/Instr No",
      accessor: (row) =>
        row.selectMachineInstNo ||
        row.machineInstNo?.machineInstrumentNo ||
        "",
      type: "text",
    },
    {
      key: "machineInstNo",
      label: "Machine/Instrument",
      accessor: (row) =>
        row.machineInstNo?.machineInstrumentNo ||
        row.machineInstNo?.machineInstrumentName ||
        row.machineInstNo?.id ||
        "",
      type: "text",
    },
    {
      key: "location",
      label: "Location",
      accessor: (row) =>
        typeof row.location === "object"
          ? row.location.locationName || row.location.id
          : row.location || "",
      type: "text",
    },
    {
      key: "certificateNo",
      label: "Certificate No",
      accessor: (row) => row.certificateNo || "",
      type: "text",
    },
    {
      key: "calibrationAgency",
      label: "Calibration Agency",
      accessor: (row) => row.calibrationAgency.code || "",
      type: "text",
    },
    {
      key: "checkedBy",
      label: "Checked By",
      accessor: (row) =>
        row.checkedBy?.employeeName ||
        row.checkedBy?.employeeCode ||
        row.checkedBy?.employeeId ||
        "",
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
    "id",
    "branch",
    "branch.branchName",
    "branch.id",
    "department",
    "department.departmentName",
    "department.id",
    "selectMachineInstNo",
    "machineInstNo.machineInstrumentNo",
    "machineInstNo.machineInstrumentName",
    "location",
    "location.locationName",
    "certificateNo",
    "calibrationAgency",
    "checkedBy.employeeName",
    "checkedBy.employeeCode",
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
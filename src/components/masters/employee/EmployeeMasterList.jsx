import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import employeeAPI from "../../../api/employeeAPI";
import { useToast } from "../../Toast/ToastContext";

// Flattens the nested employeeMasterVO shape into the row shape the table expects.
// Keeps the original VO under `raw` so onEdit gets the full record for the form.
const mapEmployeeRow = (e) => ({
  id: e.id,
  employeeId: e.employeeId ?? e.empId ?? "-",
  employeeName:
    e.employeeName ||
    [e.surName, e.middleName].filter(Boolean).join(" ") ||
    "-",
  employeeType: e.natureOfEmployment || "-",
  department: e.department?.departmentName || e.department || "-",
  designation: e.designation?.designationName || e.designation || "-",
  gender: e.sex || "-",
  dateOfJoining: e.dateOfJoining || "-",
  jobLocation: e.plant?.branchName || e.branch?.branchName || "-",
  country: e.permanentCountry?.countryName || e.tempCountry?.countryName || "-",
  active:
    e.active === true ||
    e.active === "true" ||
    e.active === 1 ||
    e.isActive === true,
  raw: e,
});

const EmployeeMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const orgId = localStorage.getItem("orgId");

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const list = await employeeAPI.getEmployeeByOrgId(orgId);
      const rows = (list || []).map(mapEmployeeRow).sort((a, b) => b.id - a.id);
      setEmployeeData(rows);
    } catch (error) {
      console.error("Error loading employees:", error);
      addToast("Failed to load employees");
      setEmployeeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) loadEmployees();
  }, [orgId]);

  // Pass the full raw VO to the form so it has every nested object to populate from
  const handleEdit = (row) => {
    onEdit(row.raw || row);
  };

  const columns = [
    {
      key: "employeeId",
      label: "Employee ID",
      accessor: "employeeId",
      type: "text",
      noWrap: true,
    },
    {
      key: "employeeName",
      label: "Employee Name",
      accessor: "employeeName",
      type: "text",
    },
    {
      key: "employeeType",
      label: "Employee Type",
      accessor: "employeeType",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "designation",
      label: "Designation",
      accessor: "designation",
      type: "text",
    },
    { key: "gender", label: "Gender", accessor: "gender", type: "text" },
    {
      key: "dateOfJoining",
      label: "Joining Date",
      accessor: "dateOfJoining",
      type: "text",
    },
    {
      key: "jobLocation",
      label: "Job Location",
      accessor: "jobLocation",
      type: "text",
    },
    { key: "country", label: "Country", accessor: "country", type: "text" },
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
    "employeeId",
    "employeeName",
    "department",
    "designation",
    "employeeType",
    "country",
    "jobLocation",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
    {
      value: true,
      label: "Active",
      field: "active",
      filterValue: true,
    },
    {
      value: false,
      label: "Inactive",
      field: "active",
      filterValue: false,
    },
  ];

  return (
    <CommonListViewTable
      title="Employee "
      data={employeeData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Employees found"
      loadingMessage="Loading Employees..."
      enableRefresh={true}
      onRefresh={loadEmployees}
      enableExport={true}
      exportFileName="Employees"
    />
  );
};

export default EmployeeMasterList;

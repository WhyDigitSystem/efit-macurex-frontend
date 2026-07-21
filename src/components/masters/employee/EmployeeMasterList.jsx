import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const EmployeeMasterList = ({ onAddNew, onEdit }) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
      {
        id: 8,
        employeeCode: "EMP008",
        employeeName: "Arjun Kumar",
        designation: "Software Engineer",
        department: "IT",
        email: "arjun.kumar@company.com",
        mobile: "9876543210",
        active: true,
      },
      {
        id: 7,
        employeeCode: "EMP007",
        employeeName: "Priya Sharma",
        designation: "HR Executive",
        department: "HR",
        email: "priya.sharma@company.com",
        mobile: "9876543211",
        active: true,
      },
      {
        id: 6,
        employeeCode: "EMP006",
        employeeName: "Rahul Verma",
        designation: "Accountant",
        department: "Finance",
        email: "rahul.verma@company.com",
        mobile: "9876543212",
        active: false,
      },
      {
        id: 5,
        employeeCode: "EMP005",
        employeeName: "Sneha Reddy",
        designation: "Sales Executive",
        department: "Sales",
        email: "sneha.reddy@company.com",
        mobile: "9876543213",
        active: true,
      },
      {
        id: 4,
        employeeCode: "EMP004",
        employeeName: "Vikram Singh",
        designation: "Store Manager",
        department: "Stores",
        email: "vikram.singh@company.com",
        mobile: "9876543214",
        active: true,
      },
      {
        id: 3,
        employeeCode: "EMP003",
        employeeName: "Meera Nair",
        designation: "Purchase Officer",
        department: "Purchase",
        email: "meera.nair@company.com",
        mobile: "9876543215",
        active: false,
      },
      {
        id: 2,
        employeeCode: "EMP002",
        employeeName: "Rohan Das",
        designation: "Marketing Executive",
        department: "Marketing",
        email: "rohan.das@company.com",
        mobile: "9876543216",
        active: true,
      },
      {
        id: 1,
        employeeCode: "EMP001",
        employeeName: "Anita Rao",
        designation: "Administrator",
        department: "Administration",
        email: "anita.rao@company.com",
        mobile: "9876543217",
        active: true,
      },
    ];

    data.sort((a, b) => b.id - a.id);

    setEmployeeData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEdit = (employee) => {
    onEdit(employee);
  };

  const columns = [
    {
      key: "employeeCode",
      label: "Employee Code",
      accessor: "employeeCode",
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
      key: "designation",
      label: "Designation",
      accessor: "designation",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      type: "text",
    },
    {
      key: "mobile",
      label: "Mobile",
      accessor: "mobile",
      type: "text",
      noWrap: true,
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
    "employeeCode",
    "employeeName",
    "designation",
    "department",
    "email",
    "mobile",
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
    <CommonListViewTable
      title="Employee Master"
      subtitle="Manage Employees"
      data={employeeData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
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
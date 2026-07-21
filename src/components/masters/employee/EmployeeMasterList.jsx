import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const EmployeeMasterList = ({ onAddNew, onEdit,onBack }) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
  {
    id: 8,
    employeeId: "EMP008",
    salutation: "Mr.",
    firstName: "Arjun",
    lastName: "Kumar",
    employeeName: "Arjun Kumar",
    aadharNo: "987654321012",
    fatherName: "Ramesh Kumar",
    dateOfBirth: "15-08-1995",
    gender: "Male",
    maritalStatus: "Single",
    bloodGroup: "B+",
    employeeType: "Permanent",
    dateOfJoining: "01-06-2023",
    department: "IT",
    designation: "Software Engineer",
    payCategory: "Monthly",
    minimumWageCategory: "Skilled",
    country: "India",
    ptState: "Karnataka",
    jobLocation: "Bangalore",
    dateOfLeaving: "",
    active: true,
  },
  {
    id: 7,
    employeeId: "EMP007",
    salutation: "Ms.",
    firstName: "Priya",
    lastName: "Sharma",
    employeeName: "Priya Sharma",
    aadharNo: "987654321013",
    fatherName: "Mahesh Sharma",
    dateOfBirth: "22-02-1994",
    gender: "Female",
    maritalStatus: "Married",
    bloodGroup: "O+",
    employeeType: "Permanent",
    dateOfJoining: "15-01-2022",
    department: "HR",
    designation: "HR Executive",
    payCategory: "Monthly",
    minimumWageCategory: "Skilled",
    country: "India",
    ptState: "Karnataka",
    jobLocation: "Bangalore",
    dateOfLeaving: "",
    active: true,
  },
  {
    id: 6,
    employeeId: "EMP006",
    salutation: "Mr.",
    firstName: "Rahul",
    lastName: "Verma",
    employeeName: "Rahul Verma",
    aadharNo: "987654321014",
    fatherName: "Suresh Verma",
    dateOfBirth: "10-11-1992",
    gender: "Male",
    maritalStatus: "Married",
    bloodGroup: "A+",
    employeeType: "Contract",
    dateOfJoining: "20-04-2021",
    department: "Finance",
    designation: "Accountant",
    payCategory: "Monthly",
    minimumWageCategory: "Semi Skilled",
    country: "India",
    ptState: "Karnataka",
    jobLocation: "Mysore",
    dateOfLeaving: "",
    active: false,
  },
  {
    id: 5,
    employeeId: "EMP005",
    salutation: "Mrs.",
    firstName: "Sneha",
    lastName: "Reddy",
    employeeName: "Sneha Reddy",
    aadharNo: "987654321015",
    fatherName: "Ravi Reddy",
    dateOfBirth: "18-09-1993",
    gender: "Female",
    maritalStatus: "Married",
    bloodGroup: "AB+",
    employeeType: "Permanent",
    dateOfJoining: "11-09-2020",
    department: "Sales",
    designation: "Sales Executive",
    payCategory: "Monthly",
    minimumWageCategory: "Skilled",
    country: "India",
    ptState: "Telangana",
    jobLocation: "Hyderabad",
    dateOfLeaving: "",
    active: true,
  },
  {
    id: 4,
    employeeId: "EMP004",
    salutation: "Mr.",
    firstName: "Vikram",
    lastName: "Singh",
    employeeName: "Vikram Singh",
    aadharNo: "987654321016",
    fatherName: "Mohan Singh",
    dateOfBirth: "05-06-1988",
    gender: "Male",
    maritalStatus: "Married",
    bloodGroup: "B-",
    employeeType: "Permanent",
    dateOfJoining: "01-02-2019",
    department: "Stores",
    designation: "Store Manager",
    payCategory: "Monthly",
    minimumWageCategory: "Highly Skilled",
    country: "India",
    ptState: "Tamil Nadu",
    jobLocation: "Chennai",
    dateOfLeaving: "",
    active: true,
  },
  {
    id: 3,
    employeeId: "EMP003",
    salutation: "Ms.",
    firstName: "Meera",
    lastName: "Nair",
    employeeName: "Meera Nair",
    aadharNo: "987654321017",
    fatherName: "Krishnan Nair",
    dateOfBirth: "30-01-1990",
    gender: "Female",
    maritalStatus: "Single",
    bloodGroup: "O-",
    employeeType: "Contract",
    dateOfJoining: "05-12-2021",
    department: "Purchase",
    designation: "Purchase Officer",
    payCategory: "Monthly",
    minimumWageCategory: "Skilled",
    country: "India",
    ptState: "Kerala",
    jobLocation: "Kochi",
    dateOfLeaving: "",
    active: false,
  },
  {
    id: 2,
    employeeId: "EMP002",
    salutation: "Mr.",
    firstName: "Rohan",
    lastName: "Das",
    employeeName: "Rohan Das",
    aadharNo: "987654321018",
    fatherName: "Bikash Das",
    dateOfBirth: "25-12-1991",
    gender: "Male",
    maritalStatus: "Single",
    bloodGroup: "A-",
    employeeType: "Permanent",
    dateOfJoining: "18-07-2022",
    department: "Marketing",
    designation: "Marketing Executive",
    payCategory: "Monthly",
    minimumWageCategory: "Skilled",
    country: "India",
    ptState: "West Bengal",
    jobLocation: "Kolkata",
    dateOfLeaving: "",
    active: true,
  },
  {
    id: 1,
    employeeId: "EMP001",
    salutation: "Mrs.",
    firstName: "Anita",
    lastName: "Rao",
    employeeName: "Anita Rao",
    aadharNo: "987654321019",
    fatherName: "Shankar Rao",
    dateOfBirth: "12-05-1987",
    gender: "Female",
    maritalStatus: "Married",
    bloodGroup: "O+",
    employeeType: "Permanent",
    dateOfJoining: "10-03-2018",
    department: "Administration",
    designation: "Administrator",
    payCategory: "Monthly",
    minimumWageCategory: "Highly Skilled",
    country: "India",
    ptState: "Karnataka",
    jobLocation: "Bangalore",
    dateOfLeaving: "",
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
  {
    key: "gender",
    label: "Gender",
    accessor: "gender",
    type: "text",
  },
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
  {
    key: "country",
    label: "Country",
    accessor: "country",
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
  "firstName",
  "lastName",
  "department",
  "designation",
  "employeeType",
  "country",
  "jobLocation",
  "ptState",
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
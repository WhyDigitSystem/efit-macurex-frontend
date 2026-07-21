import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const CompanyMasterList = ({ onAddNew, onEdit }) => {
  const [companyData, setCompanyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
      {
        id: 6,
        companyCode: "COMP006",
        companyName: "Global Tech Solutions",
        contactPerson: "David Wilson",
        email: "david@globaltech.com",
        phone: "9876543210",
        city: "Bangalore",
        active: true,
      },
      {
        id: 5,
        companyCode: "COMP005",
        companyName: "Prime Industries",
        contactPerson: "Sophia Brown",
        email: "sophia@prime.com",
        phone: "9988776655",
        city: "Hyderabad",
        active: false,
      },
      {
        id: 4,
        companyCode: "COMP004",
        companyName: "Blue Sky Pvt Ltd",
        contactPerson: "Michael Scott",
        email: "michael@bluesky.com",
        phone: "9123456780",
        city: "Mumbai",
        active: true,
      },
      {
        id: 3,
        companyCode: "COMP003",
        companyName: "Sunrise Enterprises",
        contactPerson: "Emma Watson",
        email: "emma@sunrise.com",
        phone: "9012345678",
        city: "Chennai",
        active: true,
      },
      {
        id: 2,
        companyCode: "COMP002",
        companyName: "NextGen Software",
        contactPerson: "John Doe",
        email: "john@nextgen.com",
        phone: "9876501234",
        city: "Pune",
        active: false,
      },
      {
        id: 1,
        companyCode: "COMP001",
        companyName: "ABC Technologies",
        contactPerson: "Arun Kumar",
        email: "arun@abctech.com",
        phone: "9876541230",
        city: "Mysore",
        active: true,
      },
    ];

    data.sort((a, b) => b.id - a.id);

    setCompanyData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleEdit = (company) => {
    onEdit(company);
  };

  const columns = [
    {
      key: "companyCode",
      label: "Company Code",
      accessor: "companyCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "companyName",
      label: "Company Name",
      accessor: "companyName",
      type: "text",
    },
    {
      key: "contactPerson",
      label: "Contact Person",
      accessor: "contactPerson",
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      type: "text",
    },
    {
      key: "phone",
      label: "Phone",
      accessor: "phone",
      type: "text",
    },
    {
      key: "city",
      label: "City",
      accessor: "city",
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
    "companyCode",
    "companyName",
    "contactPerson",
    "email",
    "phone",
    "city",
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
      title="Company Master"
      subtitle="Manage Companies"
      data={companyData}
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
      emptyMessage="No Companies found"
      loadingMessage="Loading Companies..."
      enableRefresh={true}
      onRefresh={loadCompanies}
      enableExport={true}
      exportFileName="Companies"
    />
  );
};

export default CompanyMasterList;
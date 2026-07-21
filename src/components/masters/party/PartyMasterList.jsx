import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const PartyMasterList = ({ onAddNew, onEdit }) => {
  const [partyData, setPartyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadParties = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
      {
        id: 6,
        partyCode: "PTY006",
        partyName: "ABC Traders",
        partyType: "Customer",
        contactPerson: "Rahul Sharma",
        mobile: "9876543210",
        city: "Bangalore",
        gstNo: "29ABCDE1234F1Z5",
        active: true,
      },
      {
        id: 5,
        partyCode: "PTY005",
        partyName: "Global Suppliers",
        partyType: "Vendor",
        contactPerson: "Priya Nair",
        mobile: "9988776655",
        city: "Hyderabad",
        gstNo: "36ABCDE5678K1Z2",
        active: true,
      },
      {
        id: 4,
        partyCode: "PTY004",
        partyName: "Sunrise Enterprises",
        partyType: "Customer",
        contactPerson: "Arjun Kumar",
        mobile: "9123456789",
        city: "Chennai",
        gstNo: "33ABCDE1111H1Z7",
        active: false,
      },
      {
        id: 3,
        partyCode: "PTY003",
        partyName: "Prime Distributors",
        partyType: "Vendor",
        contactPerson: "Sneha Rao",
        mobile: "9012345678",
        city: "Pune",
        gstNo: "27ABCDE9999L1Z3",
        active: true,
      },
      {
        id: 2,
        partyCode: "PTY002",
        partyName: "Tech Solutions",
        partyType: "Customer",
        contactPerson: "John Peter",
        mobile: "9090909090",
        city: "Mumbai",
        gstNo: "27ABCDE5555P1Z6",
        active: true,
      },
      {
        id: 1,
        partyCode: "PTY001",
        partyName: "Sri Lakshmi Agencies",
        partyType: "Vendor",
        contactPerson: "Ramesh",
        mobile: "9876501234",
        city: "Mysore",
        gstNo: "29ABCDE7777M1Z1",
        active: false,
      },
    ];

    data.sort((a, b) => b.id - a.id);

    setPartyData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadParties();
  }, []);

  const handleEdit = (party) => {
    onEdit(party);
  };

  const columns = [
    {
      key: "partyCode",
      label: "Party Code",
      accessor: "partyCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "partyType",
      label: "Type",
      accessor: "partyType",
      type: "text",
    },
    {
      key: "contactPerson",
      label: "Contact Person",
      accessor: "contactPerson",
      type: "text",
    },
    {
      key: "mobile",
      label: "Mobile",
      accessor: "mobile",
      type: "text",
    },
    {
      key: "city",
      label: "City",
      accessor: "city",
      type: "text",
    },
    {
      key: "gstNo",
      label: "GST No",
      accessor: "gstNo",
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
    "partyCode",
    "partyName",
    "partyType",
    "contactPerson",
    "mobile",
    "city",
    "gstNo",
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
      title="Party Master"
      subtitle="Manage Parties"
      data={partyData}
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
      emptyMessage="No Parties found"
      loadingMessage="Loading Parties..."
      enableRefresh={true}
      onRefresh={loadParties}
      enableExport={true}
      exportFileName="Parties"
    />
  );
};

export default PartyMasterList;
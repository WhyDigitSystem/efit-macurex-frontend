import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import partyMasterAPI from "../../../api/partyMasterAPI";

const PartyMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [partyData, setPartyData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadParties = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      const response = await partyMasterAPI.getPartyByOrgId(orgId, branchId);

      // Transform API response to match the table format
      const transformedData = (response || []).map(item => ({
        id: item.id || 0,
        partyCode: item.docId || "",
        partyName: item.customerName || "",
        shortName: item.tradeName || "",
        gstPartyName: item.customerLegalName || "",
        partyType: item.customerType || "",
        customerType: item.customerType || "",
        agentName: item.introducedBy || "",
        accountType: item.accountName || "",
        businessType: item.customerCategory?.description || "",
        carrierCode: "",
        supplierType: item.supplierType?.description || "",
        salesPerson: "",
        customerCoordinator: "",
        accountName: item.accountName || "",
        gstRegistered: item.registered || false,
        gstNo: item.gstNo || "",
        creditLimit: item.partyCreditLimit || 0,
        creditDays: item.partyCreditPeriod || 0,
        panNo: "",
        controllingOffice: "",
        currency: "INR",
        panName: "",
        airWayBillCode: "",
        airlineCode: "",
        tanNo: "",
        businessCategory: "",
        country: item.country?.countryName || "",
        caf: "",
        compoundingScheme: "",
        psuGovtOrganization: "",
        remarks: item.remarks || "",
        active: item.active === "Active",
        bankName: item.bankName || "",
        branch: item.branch?.branchName || "",
        bankAddress: "",
        accountNo: item.bankAccountNo || "",
        accountTypeBank: "",
        ifscCode: item.ifscCode || "",
        swift: "",
        contactPerson: item.contactPerson || "",
        mobile: item.phone || "",
        contactEmail: item.email || "",
        city: item.city?.cityName || "",
        state: item.state?.stateName || "",
        stateCode: item.gstState?.stateCode || "",
        stateNo: item.gstState?.gstStateId || "",
      }));

      // Sort by id in descending order
      transformedData.sort((a, b) => b.id - a.id);

      setPartyData(transformedData);
    } catch (error) {
      console.error("Error loading parties:", error);
      setPartyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParties();
  }, []);

  const handleEdit = (party) => {
    // Find the original data from API response to pass to edit
    const originalData = partyData.find(item => item.id === party.id);
    onEdit(originalData);
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
      key: "shortName",
      label: "Short Name",
      accessor: "shortName",
      type: "text",
    },
    {
      key: "partyType",
      label: "Party Type",
      accessor: "partyType",
      type: "text",
    },
    {
      key: "customerType",
      label: "Customer Type",
      accessor: "customerType",
      type: "text",
    },
    {
      key: "businessType",
      label: "Business Type",
      accessor: "businessType",
      type: "text",
    },
    {
      key: "accountType",
      label: "Account Type",
      accessor: "accountType",
      type: "text",
    },
    {
      key: "gstNo",
      label: "GSTIN",
      accessor: "gstNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "panNo",
      label: "PAN No",
      accessor: "panNo",
      type: "text",
    },
    {
      key: "mobile",
      label: "Mobile",
      accessor: "mobile",
      type: "text",
    },
    {
      key: "country",
      label: "Country",
      accessor: "country",
      type: "text",
    },
    {
      key: "currency",
      label: "Currency",
      accessor: "currency",
      type: "text",
    },
    {
      key: "creditLimit",
      label: "Credit Limit",
      accessor: "creditLimit",
      type: "text",
      align: "right",
    },
    {
      key: "creditDays",
      label: "Credit Days",
      accessor: "creditDays",
      type: "text",
      align: "center",
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
    "shortName",
    "partyType",
    "customerType",
    "businessType",
    "accountType",
    "gstNo",
    "panNo",
    "mobile",
    "country",
    "currency",
    "salesPerson",
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
      title="Party "
      data={partyData}
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
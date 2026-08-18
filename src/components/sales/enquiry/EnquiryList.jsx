import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import enquiryAPI from "../../../api/Sales/enquiryAPI";

const EnquiryList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");
        setItemData([]);
        setLoading(false);
        return;
      }

      const response = await enquiryAPI.getEnquiryByOrgId(orgId, branchId);
      
      console.log("API Response:", response);

      // Extract the enquiry list from the response
      let enquiries = [];
      if (response?.paramObjectsMap?.enquiryList) {
        enquiries = response.paramObjectsMap.enquiryList;
      } else if (Array.isArray(response)) {
        enquiries = response;
      }

      // Transform the data for the table
      const transformedData = enquiries.map((enquiry) => ({
        id: enquiry.id,
        enquiryNo: enquiry.enquiryNo || "",
        enquiryType: enquiry.enquiryType || "",
        enquiryDate: enquiry.enquiryDate || "",
        branchName: enquiry.branch?.branchName || "",
        branchCode: enquiry.branch?.branchCode || "",
        partyName: enquiry.partyName || "",
        partyRefNo: enquiry.partyRefNo || "",
        partyRefDate: enquiry.partyRefDate || "",
        enquiryDueDate: enquiry.enquiryDueDate || "",
        contactName: enquiry.contactName?.employeeName || "",
        contactEmail: enquiry.contactEmail || "",
        status: enquiry.status || "",
        active: enquiry.active === "Active",
        createdBy: enquiry.createdBy || "",
        orgId: enquiry.orgId || "",
        cancelRemarks: enquiry.cancelRemarks || "",
        enquiryDetails: enquiry.enquiryDetails || [],
        enquiryTermsandCond: enquiry.enquiryTermsandCond || [],
        enquiryAttachmentDTO: enquiry.enquiryAttachmentDTO || [],
      }));

      // Sort by id descending (newest first)
      transformedData.sort((a, b) => b.id - a.id);

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading enquiries:", error);
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const columns = [
    {
      key: "enquiryNo",
      label: "Enquiry No",
      accessor: "enquiryNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "enquiryType",
      label: "Enquiry Type",
      accessor: "enquiryType",
      type: "text",
    },
    {
      key: "enquiryDate",
      label: "Enquiry Date",
      accessor: "enquiryDate",
      type: "date",
    },
    {
      key: "branchCode",
      label: "Branch",
      accessor: "branchCode",
      type: "text",
    },
    {
      key: "partyName",
      label: "Party Name",
      accessor: "partyName",
      type: "text",
    },
    {
      key: "partyRefNo",
      label: "Party Ref No",
      accessor: "partyRefNo",
      type: "text",
    },
    {
      key: "enquiryDueDate",
      label: "Due Date",
      accessor: "enquiryDueDate",
      type: "date",
    },
    {
      key: "contactName",
      label: "Contact",
      accessor: "contactName",
      type: "text",
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
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
    "enquiryNo",
    "enquiryType",
    "branchCode",
    "branchName",
    "partyName",
    "partyRefNo",
    "contactName",
    "contactEmail",
    "status",
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
      title="Enquiry"
      data={itemData}
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
      emptyMessage="No Enquiries found"
      loadingMessage="Loading Enquiries..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="Enquiries"
    />
  );
};

export default EnquiryList;
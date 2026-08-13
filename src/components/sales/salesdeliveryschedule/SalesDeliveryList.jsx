import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import salesDeliveryAPI from "../../../api/Sales/salesDelivery";

const SalesDeliveryList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));

  const loadItems = async () => {
    try {
      setLoading(true);

      // Call the API to get sales delivery schedule list
      const response = await salesDeliveryAPI.getSalesDelivery(orgId, branchId);

      console.log("Sales Delivery API Response:", response);

      // Extract the list from the response
      const salesList = response?.paramObjectsMap?.salesDeliveryScheduleList || [];

      // Transform the data for the table
      const transformedData = salesList.map((item) => ({
        id: item.id,
        dlvNo: item.dlvNo || "-",
        dlvDate: item.dlvDate || "-",
        branch: item.branch?.branchName || "-",
        branchCode: item.branch?.branchCode || "-",
        monthOfSchedule: item.monthOfSchedule || "-",
        monthYear: item.monthYear || "-",
        belongsTo: item.belongsTo || "-",
        customerCode: item.customer?.customerCode || "-",
        customerName: item.customer?.customerName || "-",
        financialYear: item.financialYear || "-",
        remarks: item.remarks || "-",
        active: item.active === "Active",
        status: item.active || "Inactive",
        details: item.details || [],
        // Store the full item for editing
        rawData: item,
      }));

      // Sort by id in descending order (newest first)
      transformedData.sort((a, b) => b.id - a.id);

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading sales delivery list:", error);
      // Show error message to user
      alert(error.message || "Failed to load sales delivery schedule list");
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    // Pass the raw data for editing
    onEdit(item.rawData || item);
  };

  const columns = [
    {
      key: "dlvNo",
      label: "Div No.",
      accessor: "dlvNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "dlvDate",
      label: "Div Date",
      accessor: "dlvDate",
      type: "text",
    },
    {
      key: "branchCode",
      label: "Branch",
      accessor: "branchCode",
      type: "text",
    },
    {
      key: "monthOfSchedule",
      label: "Month",
      accessor: "monthOfSchedule",
      type: "text",
    },
    {
      key: "monthYear",
      label: "Year",
      accessor: "monthYear",
      type: "text",
    },
    {
      key: "customerCode",
      label: "Customer Code",
      accessor: "customerCode",
      type: "text",
    },
    {
      key: "customerName",
      label: "Customer Name",
      accessor: "customerName",
      type: "text",
    },
    {
      key: "remarks",
      label: "Remarks",
      accessor: "remarks",
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
    "dlvNo",
    "dlvDate",
    "branchCode",
    "branch",
    "monthOfSchedule",
    "monthYear",
    "customerCode",
    "customerName",
    "remarks",
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
      title="Sales Delivery List"
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
      emptyMessage="No Sales Delivery Schedule found"
      loadingMessage="Loading Sales Delivery Schedule..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="SalesDeliverySchedule"
    />
  );
};

export default SalesDeliveryList;
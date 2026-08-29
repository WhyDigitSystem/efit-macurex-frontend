import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import gstRateApi from "../../../api/gatRateAPI";

const GSTRateList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const orgId = localStorage.getItem("orgId");
      const branch = localStorage.getItem("branchId");

      if (!orgId) {
        throw new Error("Organization ID or Branch ID not found");
      }

      const response = await gstRateApi.getGstRateList(orgId);
      console.log("Full API Response:", response);

      // Extract the transportList from the response
      const transportList = response?.paramObjectsMap?.transportList || [];
      console.log("Transport List:", transportList);

      if (!transportList || transportList.length === 0) {
        console.log("No data found in transportList");
        setItemData([]);
        setLoading(false);
        return;
      }

      // Transform the data to match the table structure
      const transformedData = transportList.map(item => {
        console.log("Processing item:", item);

        return {
          id: item.id || 0,
          // Ensure all fields are strings, not objects
          category: typeof item.category === 'object'
            ? item.category?.valueDescription || item.category?.toString() || ""
            : item.category || "",
          hsnSacCode: typeof item.hsnSacCode === 'object'
            ? item.hsnSacCode?.hsn || item.hsnSacCode?.toString() || ""
            : item.hsnSacCode || "",
          description: item.description || "",
          wef: item.wef || "",
          taxable: item.taxable ? "Yes" : "No",
          rate: item.rate?.toString() || "",
          igstRate: item.igst?.toString() || "",
          sgstRate: item.sgst?.toString() || "",
          cgstRate: item.cgst?.toString() || "",
          active: item.active === "Active",
          // Don't spread the original item to avoid passing objects
        };
      });

      console.log("Transformed Data:", transformedData);

      // Sort by ID descending (newest first)
      transformedData.sort((a, b) => (b.id || 0) - (a.id || 0));

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading GST Rates:", error);
      setError(error.message || "Failed to load GST Rates");
      setItemData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    // Pass the full original data for editing
    onEdit(item);
  };

  const columns = [
    {
      key: "category",
      label: "Category",
      accessor: "category",
      type: "text",
      noWrap: true,
    },
    {
      key: "hsnSacCode",
      label: "HSN/SAC Code",
      accessor: "hsnSacCode",
      type: "text",
    },
    {
      key: "description",
      label: "Description",
      accessor: "description",
      type: "text",
    },
    {
      key: "wef",
      label: "WEF",
      accessor: "wef",
      type: "text",
    },
    {
      key: "taxable",
      label: "Taxable",
      accessor: "taxable",
      type: "text",
    },
    {
      key: "rate",
      label: "Rate (%)",
      accessor: "rate",
      type: "text",
    },
    {
      key: "igstRate",
      label: "IGST Rate (%)",
      accessor: "igstRate",
      type: "text",
    },
    {
      key: "sgstRate",
      label: "SGST Rate (%)",
      accessor: "sgstRate",
      type: "text",
    },
    {
      key: "cgstRate",
      label: "CGST Rate (%)",
      accessor: "cgstRate",
      type: "text",
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
    "category",
    "hsnSacCode",
    "description",
    "wef",
    "rate",
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
      title="GST Rate List"
      subtitle="Manage GST Rates"
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
      emptyMessage={error || "No GST Rates found"}
      loadingMessage="Loading GST Rates..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="GSTRates"
    />
  );
};

export default GSTRateList;
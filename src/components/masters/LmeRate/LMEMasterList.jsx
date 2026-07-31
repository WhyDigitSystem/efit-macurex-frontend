import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { lmeAPI } from "../../../api/lmeApi";

const LMEMasterList = ({ onAddNew, onEdit, onBack }) => {
  const [lmeData, setLmeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));

  const loadLME = async () => {
    setLoading(true);
    try {
      const response = await lmeAPI.getAllLME(orgId, branch);
      console.log("LME API Response:", response);

      // Handle the nested response structure
      let lmeList = [];

      if (response) {
        // Check for paramObjectsMap.transportList structure
        if (response.paramObjectsMap && response.paramObjectsMap.transportList) {
          lmeList = response.paramObjectsMap.transportList;
        }
        // Check for data property with paramObjectsMap
        else if (response.data && response.data.paramObjectsMap && response.data.paramObjectsMap.transportList) {
          lmeList = response.data.paramObjectsMap.transportList;
        }
        // Fallback: check if response is directly an array
        else if (Array.isArray(response)) {
          lmeList = response;
        }
        // Fallback: check if response.data is an array
        else if (response.data && Array.isArray(response.data)) {
          lmeList = response.data;
        }
      }

      // Map the data to the format expected by the table
      if (lmeList.length > 0) {
        const mappedData = lmeList.map((item) => {
          // Extract currency information from nested object
          let currencySymbol = "";
          let currencyName = "";

          if (item.currencyName) {
            // If currencyName is an object (nested structure)
            if (typeof item.currencyName === 'object') {
              currencySymbol = item.currencyName.currency || item.currencySymbol || "";
              currencyName = item.currencyName.mainCurrency || item.currencyName.currencyDescription || "";
            } else {
              // If currencyName is a string
              currencyName = item.currencyName || "";
              currencySymbol = item.currencySymbol || "";
            }
          } else {
            // Fallback to direct properties
            currencySymbol = item.currencySymbol || "";
            currencyName = item.currencyName || "";
          }

          return {
            id: item.id,
            currencySymbol: currencySymbol,
            currencyName: currencyName,
            lmeRate: item.lmeRate || "",
            lmeDateFrom: item.lmeDateFrom || "",
            lmeDateTo: item.elmeDateTo || item.lmeDateTo || "",
            active: item.active === "Active" ? true : (item.active ?? true),
            // Keep original data for reference if needed
            originalData: item
          };
        });

        // Sort by ID descending (newest first)
        mappedData.sort((a, b) => b.id - a.id);
        setLmeData(mappedData);
      } else {
        setLmeData([]);
      }
    } catch (error) {
      console.error("Error loading LME data:", error);
      setLmeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLME();
  }, []);

  const handleEdit = (lme) => {
    // Pass the original data for editing
    onEdit(lme.originalData || lme);
  };

  const columns = [
    {
      key: "currencySymbol",
      label: "Currency Symbol",
      accessor: "currencySymbol",
      type: "text",
      noWrap: true,
    },
    {
      key: "currencyName",
      label: "Currency Name",
      accessor: "currencyName",
      type: "text",
    },
    {
      key: "lmeRate",
      label: "LME Rate",
      accessor: "lmeRate",
      type: "text",
      align: "right",
    },
    {
      key: "lmeDateFrom",
      label: "LME Date From",
      accessor: "lmeDateFrom",
      type: "text",
      noWrap: true,
    },
    {
      key: "lmeDateTo",
      label: "LME Date To",
      accessor: "lmeDateTo",
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
    "currencySymbol",
    "currencyName",
    "lmeRate",
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
      title="LME"
      data={lmeData}
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
      emptyMessage="No LME records found"
      loadingMessage="Loading LME records..."
      enableRefresh={true}
      onRefresh={loadLME}
      enableExport={true}
      exportFileName="LME_Master"
    />
  );
};

export default LMEMasterList;
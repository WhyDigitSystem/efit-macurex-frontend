import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";


const ToolsFixturesList = ({ onAddNew, onEdit, onBack }) => {
  const [toolData, setToolData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTools = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      const response = await toolsFixtureAPI.getToolsByOrgId(orgId, branchId);

      // Transform API response to match the table format
      const transformedData = (response || []).map((item) => ({
        id: item.id || 0,
        plantName: item.branch?.branchName || "",
        type: item.type || "",
        department: item.department?.departmentName || "",
        toolNo: item.toolNo || "",
        toolDescription: item.toolDescription || "",
        productionWorkOrderNo: item.productionWorkOrderNo || "",
        toolCategory: item.toolCategory?.description || "",
        locationName: item.locationName || "",
        drawingNo: item.drawingNo || "",
        serialNo: item.serialNo || "",
        manufacturedBy: item.manufacturedBy || "",
        section: item.section?.description || "",
        status: item.status || "",
        madeIn: item.madeIn || "",
        toolOwnerName: item.toolOwnerName || "",
        presentLocation: item.presentLocation || "",
        totalCost: item.totalToolCost || 0,
        cavityNumber: item.cavityNumber || "",
        active: item.active === "Active" || item.active === true,
      }));

      transformedData.sort((a, b) => b.id - a.id);

      setToolData(transformedData);
    } catch (error) {
      console.error("Error loading tools/fixtures:", error);
      setToolData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleEdit = (row) => {
    const originalData = toolData.find((item) => item.id === row.id);
    onEdit(originalData);
  };

  const columns = [
    {
      key: "toolNo",
      label: "Tool No./Fixture No.",
      accessor: "toolNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "toolDescription",
      label: "Tool/Fixture Description",
      accessor: "toolDescription",
      type: "text",
    },
    {
      key: "plantName",
      label: "Plant",
      accessor: "plantName",
      type: "text",
    },
    {
      key: "type",
      label: "Type",
      accessor: "type",
      type: "text",
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      type: "text",
    },
    {
      key: "toolCategory",
      label: "Category",
      accessor: "toolCategory",
      type: "text",
    },
    {
      key: "drawingNo",
      label: "Drawing No",
      accessor: "drawingNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "serialNo",
      label: "Serial No",
      accessor: "serialNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "manufacturedBy",
      label: "Manufactured By",
      accessor: "manufacturedBy",
      type: "text",
    },
    {
      key: "madeIn",
      label: "Made In",
      accessor: "madeIn",
      type: "text",
    },
    {
      key: "presentLocation",
      label: "Present Location",
      accessor: "presentLocation",
      type: "text",
    },
    {
      key: "totalCost",
      label: "Total Cost",
      accessor: "totalCost",
      type: "text",
      align: "right",
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
      type: "text",
    },
    {
      key: "active",
      label: "Active",
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
    "toolNo",
    "toolDescription",
    "plantName",
    "type",
    "department",
    "toolCategory",
    "drawingNo",
    "serialNo",
    "manufacturedBy",
    "madeIn",
    "presentLocation",
  ];

  const filterOptions = [
    { value: "all", label: "All", field: null },
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
      title="Tools/Fixtures "
      data={toolData}
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
      emptyMessage="No Tools/Fixtures found"
      loadingMessage="Loading Tools/Fixtures..."
      enableRefresh={true}
      onRefresh={loadTools}
      enableExport={true}
      exportFileName="ToolsFixtures"
    />
  );
};

export default ToolsFixturesList;

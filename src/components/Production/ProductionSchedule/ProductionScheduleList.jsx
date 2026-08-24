import React, { useCallback, useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import productionScheduleAPI from "../../../api/Production/productionScheduleAPI";

const ProductionScheduleList = ({ onAddNew, onEdit, onBack }) => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async (orgId, branchId) => {
    setLoading(true);

    try {
      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");

        setItemData([]);

        return;
      }

      const response = await productionScheduleAPI.getByOrgId(
        orgId,
        branchId,
      );

      if (response?.status === false) {
        const msg =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to load production schedules";

        console.warn(msg);

        setItemData([]);

        return;
      }

      const schedules = Array.isArray(
        response?.paramObjectsMap?.productionScheduleList
      )
        ? response.paramObjectsMap.productionScheduleList
        : [];

      if (schedules.length === 0) {
        console.warn("No Production Schedules found");

        setItemData([]);

        return;
      }

      const transformedData = schedules.map((item) => {
        return {
          ...item,

          id: item.id,

          fromMonthYear: item.fromMonthYear || "",

          toMonthYear: item.toMonthYear || "",

          active:
            item.active === true ||
            String(item.active).toLowerCase() === "active",

          activeStatus: item.active || "",

          createdBy: item.createdBy || item.preparedBy || "",

          preparedBy: item.preparedBy || "",

          productionScheduleMonthDTO:
            item.productionScheduleMonthResponseDTO || [],

          productionScheduleDetailsDTO:
            item.productionScheduleDetailsResponseDTO || [],
        };
      });

      transformedData.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setItemData(transformedData);
    } catch (error) {
      console.error("Error loading production schedules:", error);

      setItemData([]);
    } finally {
      setLoading(false);
    }
  }, [productionScheduleAPI]);

  useEffect(() => {
    const orgId = localStorage.getItem("orgId");
    const branchId = localStorage.getItem("branchId");

    loadItems(orgId, branchId);
  }, [loadItems]);

  const handleEdit = (item) => {
    onEdit(item);
  };

  const columns = [
    {
      key: "fromMonthYear",
      label: "From Month-Year",
      accessor: "fromMonthYear",
      type: "text",
      noWrap: true,
    },

    {
      key: "toMonthYear",
      label: "To Month-Year",
      accessor: "toMonthYear",
      type: "text",
      noWrap: true,
    },

    {
      key: "createdBy",
      label: "Created By",
      accessor: "createdBy",
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

  const searchFields = ["fromMonthYear", "toMonthYear", "createdBy"];

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
      filterValue: true,
      activeValue: true,
    },

    {
      value: "inactive",
      label: "Inactive",
      field: "active",
      filterValue: false,
      activeValue: false,
    },
  ];

  return (
    <CommonListViewTable
      title="Production Schedule (for next 3 months)"
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
      emptyMessage="No Production Schedules found"
      loadingMessage="Loading Production Schedules..."
      enableRefresh={true}
      onRefresh={loadItems}
      enableExport={true}
      exportFileName="ProductionSchedules"
    />
  );
};

export default ProductionScheduleList;

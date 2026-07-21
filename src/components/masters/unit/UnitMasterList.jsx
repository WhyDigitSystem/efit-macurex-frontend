import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

const UnitMasterList = ({ onAddNew, onEdit,onBack }) => {
  const [unitData, setUnitData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUnits = async () => {
    setLoading(true);

    // Dummy Data
    const data = [
      {
        id: 8,
        unitCode: "UOM008",
        unitName: "Kilogram",
        shortName: "Kg",
        unitType: "Weight",
        decimalPlaces: 3,
        active: true,
      },
      {
        id: 7,
        unitCode: "UOM007",
        unitName: "Gram",
        shortName: "Gm",
        unitType: "Weight",
        decimalPlaces: 2,
        active: true,
      },
      {
        id: 6,
        unitCode: "UOM006",
        unitName: "Liter",
        shortName: "Ltr",
        unitType: "Volume",
        decimalPlaces: 2,
        active: true,
      },
      {
        id: 5,
        unitCode: "UOM005",
        unitName: "Milliliter",
        shortName: "Ml",
        unitType: "Volume",
        decimalPlaces: 2,
        active: true,
      },
      {
        id: 4,
        unitCode: "UOM004",
        unitName: "Meter",
        shortName: "Mtr",
        unitType: "Length",
        decimalPlaces: 2,
        active: true,
      },
      {
        id: 3,
        unitCode: "UOM003",
        unitName: "Centimeter",
        shortName: "Cm",
        unitType: "Length",
        decimalPlaces: 2,
        active: false,
      },
      {
        id: 2,
        unitCode: "UOM002",
        unitName: "Piece",
        shortName: "Nos",
        unitType: "Quantity",
        decimalPlaces: 0,
        active: true,
      },
      {
        id: 1,
        unitCode: "UOM001",
        unitName: "Box",
        shortName: "Box",
        unitType: "Packing",
        decimalPlaces: 0,
        active: false,
      },
    ];

    data.sort((a, b) => b.id - a.id);

    setUnitData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleEdit = (unit) => {
    onEdit(unit);
  };

  const columns = [
    {
      key: "unitCode",
      label: "Unit Code",
      accessor: "unitCode",
      type: "text",
      noWrap: true,
    },
    {
      key: "unitName",
      label: "Unit Name",
      accessor: "unitName",
      type: "text",
    },
    {
      key: "shortName",
      label: "Short Name",
      accessor: "shortName",
      type: "text",
    },
    {
      key: "unitType",
      label: "Unit Type",
      accessor: "unitType",
      type: "text",
    },
    {
      key: "decimalPlaces",
      label: "Decimals",
      accessor: "decimalPlaces",
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
    "unitCode",
    "unitName",
    "shortName",
    "unitType",
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
      title="Unit Master"
      subtitle="Manage Units"
      data={unitData}
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
      emptyMessage="No Units found"
      loadingMessage="Loading Units..."
      enableRefresh={true}
      onRefresh={loadUnits}
      enableExport={true}
      exportFileName="Units"
    />
  );
};

export default UnitMasterList;
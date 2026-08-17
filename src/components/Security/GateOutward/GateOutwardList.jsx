import React, { useMemo, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

// Same lookup map as the form, so the list can show a readable plant
// label instead of the raw option value. No API — local/static only.
const plantLabels = {
  PLANT1: "Plant 1 - Head Office",
  PLANT2: "Plant 2 - Unit A",
  PLANT3: "Plant 3 - Unit B",
};

const breakDownLabels = {
  YES: "Yes",
  NO: "No",
};

const GateOutwardList = ({ data, onAddNew, onEdit, onBack }) => {
  const [loading] = useState(false);

  const entryData = useMemo(
    () =>
      (data || []).map((item) => ({
        ...item,
        plant: plantLabels[item.plantId] || item.plantId || "",
        breakDownLabel: breakDownLabels[item.breakDown] || item.breakDown || "",
        itemCount: item.items?.length || 0,
      })),
    [data],
  );

  const columns = [
    {
      key: "serialNo",
      label: "Serial No.",
      accessor: "serialNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "plant",
      label: "Plant",
      accessor: "plant",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "date",
    },
    {
      key: "outwardTime",
      label: "Outward Time",
      accessor: "outwardTime",
      type: "text",
    },
    {
      key: "breakDownLabel",
      label: "Break Down ?",
      accessor: "breakDownLabel",
      type: "text",
    },
    {
      key: "materialType",
      label: "Material Type",
      accessor: "materialType",
      type: "text",
    },
    {
      key: "materialTakenOutBy",
      label: "Taken Out By",
      accessor: "materialTakenOutBy",
      type: "text",
    },
    {
      key: "materialSentTo",
      label: "Sent To",
      accessor: "materialSentTo",
      type: "text",
    },
    {
      key: "challanNo",
      label: "Challan No.",
      accessor: "challanNo",
      type: "text",
    },
    {
      key: "vehicleNo",
      label: "Vehicle No.",
      accessor: "vehicleNo",
      type: "text",
    },
    {
      key: "itemCount",
      label: "Items",
      accessor: "itemCount",
      type: "text",
      align: "center",
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
    "serialNo",
    "plant",
    "materialType",
    "materialTakenOutBy",
    "materialSentTo",
    "challanNo",
    "vehicleNo",
  ];

  return (
    <CommonListViewTable
      title="Gate Outward"
      data={entryData}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={onEdit}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Gate Outward entries found"
      loadingMessage="Loading Gate Outward entries..."
      enableExport={true}
      exportFileName="Gate Outward List"
    />
  );
};

export default GateOutwardList;

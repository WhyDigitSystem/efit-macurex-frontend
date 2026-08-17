import React, { useMemo, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";

// Same lookup maps as the form, so the list can show readable labels
// instead of raw option values. No API — everything is local/static.
const plantLabels = {
  PLANT1: "Plant 1 - Head Office",
  PLANT2: "Plant 2 - Unit A",
  PLANT3: "Plant 3 - Unit B",
};

const partyLabels = {
  P001: "ABC Traders",
  P002: "Global Supplies Pvt Ltd",
  P003: "Sunrise Industries",
};

const GateInwardList = ({ data, onAddNew, onEdit, onBack }) => {
  const [loading] = useState(false);

  const entryData = useMemo(
    () =>
      (data || []).map((item) => ({
        ...item,
        plant: plantLabels[item.plantId] || item.plantId || "",
        party: partyLabels[item.partyId] || item.partyId || "",
      })),
    [data],
  );

  const columns = [
    {
      key: "plant",
      label: "Plant",
      accessor: "plant",
      type: "text",
      noWrap: true,
    },
    {
      key: "gatePassNo",
      label: "Gate Pass No",
      accessor: "gatePassNo",
      type: "text",
    },
    {
      key: "date",
      label: "Date",
      accessor: "date",
      type: "date",
    },
    {
      key: "party",
      label: "Party Name",
      accessor: "party",
      type: "text",
    },
    {
      key: "address",
      label: "Address",
      accessor: "address",
      type: "text",
    },
    {
      key: "docType",
      label: "Doc Type",
      accessor: "docType",
      type: "text",
    },
    {
      key: "modvatCopyReceived",
      label: "Modvat Copy Received",
      accessor: "modvatCopyReceived",
      type: "text",
    },
    {
      key: "supplierInvNo",
      label: "Supplier INV. No.",
      accessor: "supplierInvNo",
      type: "text",
    },
    {
      key: "invoiceNo",
      label: "Invoice No.",
      accessor: "invoiceNo",
      type: "text",
    },
    {
      key: "supplierInvDate",
      label: "Supplier INV. Date",
      accessor: "supplierInvDate",
      type: "date",
    },
    {
      key: "timeOfEntry",
      label: "Time of Entry",
      accessor: "timeOfEntry",
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
    "plant",
    "gatePassNo",
    "party",
    "docType",
    "supplierInvNo",
    "invoiceNo",
  ];

  return (
    <CommonListViewTable
      title="Gate Inward"
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
      emptyMessage="No Gate Inward entries found"
      loadingMessage="Loading Gate Inward entries..."
      enableExport={true}
      exportFileName="Gate Inward List"
    />
  );
};

export default GateInwardList;

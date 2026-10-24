import React, { useEffect, useState } from "react";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";
import gateOutwardAPI from "../../../api/Security/Gateoutwardapi";
import branchAPI from "../../../api/branchAPI";
import { employeeAPI } from "../../../api/employeeAPI";

const labelFor = (options, value, fallback) =>
  options.find((o) => String(o.value) === String(value))?.label ||
  fallback ||
  value ||
  "";

const GateOutwardList = ({ onAddNew, onEdit, onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // Load Gate Outward entries
  // ============================================================
  const loadData = async () => {
    setLoading(true);

    try {
      const orgId = localStorage.getItem("orgId");
      const branchId = localStorage.getItem("branchId");

      if (!orgId || !branchId) {
        console.error("Missing orgId or branchId");
        toast.error("Organization or Branch information is missing");
        setData([]);
        return;
      }

      const [entries, plants, employees, types, customers] =
        await Promise.allSettled([
          gateOutwardAPI.getGateOutwardList(orgId),
          branchAPI.getBranchByOrgId(Number(orgId)),
          employeeAPI.getEmployeeByOrgId(Number(orgId)),
          gateOutwardAPI.getMaterialTypes(orgId),
          gateOutwardAPI.getCustomers({ branch: branchId, orgId }),
        ]);

      if (entries.status === "rejected") {
        throw entries.reason;
      }

      const ok = (r) => (r.status === "fulfilled" ? r.value || [] : []);

      const plantOpts = ok(plants).map((b) => ({
        value: String(b.id),
        label: b.branchName,
      }));

      const empOpts = ok(employees).map((e) => ({
        value: String(e.id),
        label: e.employeeName,
      }));

      const typeOpts = ok(types);
      const cusOpts = ok(customers);

      const rows = ok(entries).map((e) => ({
        ...e,
        plant: labelFor(plantOpts, e.plantId),
        breakDownLabel: e.breakDown === "YES" ? "Yes" : "No",
        materialTypeLabel: labelFor(
          typeOpts,
          e.materialType,
          e.materialTypeName,
        ),
        takenOutByLabel: labelFor(
          empOpts,
          e.materialTakenOutBy,
          e.materialTakenOutByName,
        ),
        sentToLabel: labelFor(cusOpts, e.materialSentTo, e.materialSentToName),
        itemCount: e.items?.length || 0,
      }));

      rows.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setData(rows);
    } catch (error) {
      console.error("Error loading Gate Outward list:", error);
      toast.error(error?.message || "Failed to load Gate Outward entries");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // Table Columns
  // ============================================================
  const columns = [
    {
      key: "docId",
      label: "Serial No.",
      accessor: "docId",
      type: "text",
      noWrap: true,
    },
    { key: "plant", label: "Plant", accessor: "plant", type: "text" },
    {
      key: "docDate",
      label: "Date",
      accessor: "docDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "outwardTime",
      label: "Outward Time",
      accessor: "outwardTime",
      type: "text",
      noWrap: true,
    },
    {
      key: "breakDownLabel",
      label: "Break Down ?",
      accessor: "breakDownLabel",
      type: "text",
    },
    {
      key: "breakDownNo",
      label: "Break Down No.",
      accessor: "breakDownNo",
      type: "text",
    },
    {
      key: "materialTypeLabel",
      label: "Material Type",
      accessor: "materialTypeLabel",
      type: "text",
    },
    {
      key: "takenOutByLabel",
      label: "Taken Out By",
      accessor: "takenOutByLabel",
      type: "text",
    },
    {
      key: "sentToLabel",
      label: "Sent To",
      accessor: "sentToLabel",
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
    "docId",
    "plant",
    "breakDownNo",
    "materialTypeLabel",
    "takenOutByLabel",
    "sentToLabel",
    "challanNo",
    "vehicleNo",
  ];

  return (
    <CommonListViewTable
      title="Gate Outward"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={(item) => item && onEdit && onEdit(item)}
      onView={false}
      showSerialNumber={true}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      emptyMessage="No Gate Outward entries found"
      loadingMessage="Loading Gate Outward entries..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="Gate_Outward"
    />
  );
};

export default GateOutwardList;

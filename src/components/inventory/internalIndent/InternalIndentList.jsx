// src/components/Inventory/InternalIndent/InternalIndentList.jsx

import { useCallback, useEffect, useState } from "react";
import internalIndentAPI from "../../../api/Inventory/internalIndentAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const InternalIndentList = ({ onAddNew, onEdit, onBack }) => {
  const [indentData, setIndentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));

  const loadIndents = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) {
      console.warn("orgId or branchId missing from localStorage");
      setIndentData([]);
      return;
    }

    try {
      setLoading(true);

      const list = await internalIndentAPI.getInternalIndentByOrgId(
        ORG_ID,
        BRANCH_ID,
      );

      const sortedData = [...(Array.isArray(list) ? list : [])].sort(
        (a, b) => Number(b?.id || 0) - Number(a?.id || 0),
      );

      setIndentData(sortedData);
    } catch (error) {
      console.error("Failed to load internal indents:", error);
      setIndentData([]);
      toast.error("Failed to fetch Internal Indents");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadIndents();
  }, [loadIndents]);

  const columns = [
    {
      key: "docId",
      label: "Doc Id",
      accessor: (row) => row?.docId || "",
      type: "text",
    },
    {
      key: "docDate",
      label: "Doc Date",
      accessor: (row) => row?.docDate || "",
      type: "date",
    },
    {
      key: "department",
      label: "Department",
      accessor: (row) => row?.department?.departmentName || "",
      type: "text",
    },
    {
      key: "plant",
      label: "Plant",
      accessor: (row) => row?.branch?.branchName || "",
      type: "text",
    },
    {
      key: "belongTo",
      label: "Belongs To",
      accessor: (row) => row?.belongTo || "",
      type: "text",
    },
    {
      key: "approvedByPM",
      label: "Approved By PM",
      accessor: (row) => row?.approvedByPM || "",
      type: "badge",
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      accessor: (row) => row?.preparedBy?.employeeName || "",
      type: "text",
    },
    {
      key: "authorizedBy",
      label: "Authorised By",
      accessor: (row) => row?.authorizedBy?.employeeName || "",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: (row) => row?.active || "",
      type: "status",
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
    "belongTo",
    "department.departmentName",
    "branch.branchName",
    "preparedBy.employeeName",
    "authorizedBy.employeeName",
  ];

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Internal Indent"
        data={indentData}
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
        emptyMessage="No Internal Indents found"
        loadingMessage="Loading Internal Indents..."
        enableRefresh={true}
        onRefresh={loadIndents}
        enableExport={true}
        exportFileName="InternalIndents"
      />
    </div>
  );
};

export default InternalIndentList;

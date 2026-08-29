import React, { useCallback, useEffect, useState } from "react";
import holidayAPI from "../../../api/holidayAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const normalizeActive = (value) => {
  if (value === true || value === "Yes" || value === "Active") return true;
  return false;
};

const HolidayMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;

  const loadData = useCallback(async () => {
    if (!ORG_ID) return;
    setLoading(true);
    try {
      const list = await holidayAPI.getAll(ORG_ID, BRANCH);
      console.log("Holiday List:", list);

      // Flatten the data to show each holiday as a separate row
      const flattenedData = [];
      (list || []).forEach((item) => {
        // If there are multiple holiday details, create a row for each
        if (item.holidayMasterDetailsVO && item.holidayMasterDetailsVO.length > 0) {
          item.holidayMasterDetailsVO.forEach((detail) => {
            flattenedData.push({
              id: detail.id || item.id,
              holidayDate: detail.holidayDate || item.holidayDate,
              day: detail.day || item.day,
              holidayType: detail.holidayType || item.holidayType,
              remarks: detail.remarks || item.remarks,
              compensatory: detail.compensatory || item.compensatory,
              compensatoryDate: detail.compensatoryDate || item.compensatoryDate,
              branch: item.branch,
              branchId: item.branchId,
              active: item.active,
              orgId: item.orgId,
              createdBy: item.createdBy,
              cancelRemarks: item.cancelRemarks,
            });
          });
        } else {
          // If no details array, use the item itself
          flattenedData.push({
            id: item.id,
            holidayDate: item.holidayDate,
            day: item.day,
            holidayType: item.holidayType,
            remarks: item.remarks,
            compensatory: item.compensatory,
            compensatoryDate: item.compensatoryDate,
            branch: item.branch,
            branchId: item.branchId,
            active: item.active,
            orgId: item.orgId,
            createdBy: item.createdBy,
            cancelRemarks: item.cancelRemarks,
          });
        }
      });

      const sorted = (flattenedData || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setData(sorted);
    } catch (error) {
      console.error("Failed to load holidays:", error);
      setData([]);
      toast.error("Failed to fetch Holidays");
    } finally {
      setLoading(false);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const columns = [
    {
      key: "holidayDate",
      label: "Date",
      accessor: "holidayDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "day",
      label: "Day",
      accessor: "day",
      type: "text",
      noWrap: true,
    },
    {
      key: "holidayType",
      label: "Holiday Type",
      accessor: "holidayType",
      type: "text",
      noWrap: true,
    },
    {
      key: "branch",
      label: "Branch",
      accessor: (row) => row.branch?.branchName || row.branch || "-",
      type: "text",
      noWrap: true,
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
      render: (value) => {
        const isActive = normalizeActive(value);
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
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

  const searchFields = ["holidayDate", "holidayType", "remarks"];

  const filterOptions = [
    { value: "all", label: "All" },
    {
      value: "active",
      label: "Active",
      filterFn: (item) => normalizeActive(item.active),
    },
    {
      value: "inactive",
      label: "Inactive",
      filterFn: (item) => !normalizeActive(item.active),
    },
  ];

  const handleEdit = (row) => {
    // Pass the entire row data for editing
    onEdit(row);
  };

  return (
    <CommonListViewTable
      title="Holiday Master"
      data={data}
      loading={loading}
      columns={columns}
      searchFields={searchFields}
      filterOptions={filterOptions}
      defaultFilter="all"
      onBack={onBack}
      onAddNew={onAddNew}
      onEdit={handleEdit}
      onView={false}
      itemsPerPageOptions={[5, 10, 20, 50, 100]}
      defaultItemsPerPage={10}
      showSerialNumber={true}
      emptyMessage="No Holidays found"
      loadingMessage="Loading Holidays..."
      enableRefresh={true}
      onRefresh={loadData}
      enableExport={true}
      exportFileName="HolidayMaster"
    />
  );
};

export default HolidayMasterList;
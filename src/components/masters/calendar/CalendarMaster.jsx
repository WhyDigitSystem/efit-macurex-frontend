import { ArrowLeft, Save, X, Plus, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import calendarAPI from "../../../api/calendarAPI";
import { useToast } from "../../../components/Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

const CalendarMaster = () => {
  const { addToast } = useToast();
  const [docId] = useState(() => "CAL" + String(Date.now()).slice(-6));
  const [docDate, setDocDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [startDate, setStartDate] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(() => dayjs().endOf("month").format("YYYY-MM-DD"));
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailRows = useMemo(() => {
    if (!startDate || !endDate) return [];

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) return [];

    const rows = [];
    let current = start;
    let sno = 0;

    while (current.isBefore(end) || current.isSame(end, "day")) {
      sno++;
      const dt = current.toDate();
      const weekNo = getWeekNumber(dt);
      const monthIndex = dt.getMonth();

      rows.push({
        sno,
        stdt: current.format("DD/MM/YYYY"),
        dateForMonth: current.format("DD/MM/YYYY"),
        day: DAYS[dt.getDay()],
        dayOfMonth: dt.getDate(),
        month: MONTHS[monthIndex],
        year: dt.getFullYear(),
        monthYear: MONTHS_SHORT[monthIndex] + "-" + dt.getFullYear(),
        weekNo,
        nwkno: weekNo,
        swkno: "Week " + weekNo,
      });

      current = current.add(1, "day");
    }

    return rows;
  }, [startDate, endDate]);

  const validate = () => {
    const errors = {};
    if (!startDate) errors.startDate = "Starting Date is required";
    if (!endDate) errors.endDate = "Ending Date is required";
    if (startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate))) {
      errors.endDate = "Ending Date must be on or after Starting Date";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (detailRows.length === 0) {
      addToast("No calendar rows to save. Please check the date range.", "warning");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      docId,
      docDate,
      startDate,
      endDate,
      details: detailRows,
    };

    try {
      await calendarAPI.createUpdate(payload);
      addToast("Calendar saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save Calendar:", error);
      addToast("Failed to save Calendar.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setDocDate(dayjs().format("YYYY-MM-DD"));
    setStartDate(dayjs().startOf("month").format("YYYY-MM-DD"));
    setEndDate(dayjs().endOf("month").format("YYYY-MM-DD"));
    setFieldErrors({});
  };

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => window.history.back()}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Calendar Master</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <div>
          <SectionHeader>Calendar Header</SectionHeader>

          <div className={fieldGrid}>
            <div>
              <label className={labelClasses}>Doc.Id</label>
              <input type="text" value={docId} readOnly className={controlClasses + " text-gray-500 dark:text-gray-500"} />
            </div>

            <div>
              <label className={labelClasses}>
                Doc.Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className={controlClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>
                Starting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (fieldErrors.startDate) setFieldErrors((p) => ({ ...p, startDate: "" }));
                }}
                className={controlClasses + (fieldErrors.startDate ? " border-red-500" : "")}
              />
              {fieldErrors.startDate && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.startDate}</p>
              )}
            </div>

            <div>
              <label className={labelClasses}>
                Ending Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (fieldErrors.endDate) setFieldErrors((p) => ({ ...p, endDate: "" }));
                }}
                className={controlClasses + (fieldErrors.endDate ? " border-red-500" : "")}
              />
              {fieldErrors.endDate && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Calendar Details</SectionHeader>
            <button
              onClick={validate}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Generate
            </button>
          </div>

          {detailRows.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {["S.No", "stdt", "sno", "Date For A Month", "Day", "Day Of Month", "Month", "Year", "Month Year", "Week No", "nwkno", "swkno"].map((h) => (
                      <th key={h} className="px-2 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-2 py-1 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white whitespace-nowrap">{row.stdt}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white">{row.sno}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white whitespace-nowrap">{row.dateForMonth}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white whitespace-nowrap">{row.day}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white">{row.dayOfMonth}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white whitespace-nowrap">{row.month}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white">{row.year}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white whitespace-nowrap">{row.monthYear}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white">{row.weekNo}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white">{row.nwkno}</td>
                      <td className="px-2 py-1 text-gray-900 dark:text-white whitespace-nowrap">{row.swkno}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500 dark:text-gray-400">
              <FileText className="h-6 w-6 mx-auto mb-1 opacity-40" />
              Select date range and click <strong>Generate</strong>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleNew}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            New
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || detailRows.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarMaster;

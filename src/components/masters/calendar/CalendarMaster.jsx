import { ArrowLeft, Save, Plus, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import calendarAPI from "../../../api/calendarAPI";
import { useToast } from "../../../components/Toast/ToastContext";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generated, setGenerated] = useState(false);

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
  }, [startDate, endDate, generated]);

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

  const handleGenerate = () => {
    if (!validate()) return;
    setGenerated((g) => !g);
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
    setStartDate("");
    setEndDate("");
    setFieldErrors({});
    setGenerated(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar Master
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-4">
            Calendar Header
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Doc.Id
              </label>
              <input
                type="text"
                value={docId}
                readOnly
                className="w-full h-10 px-3 rounded-md border text-sm bg-gray-100 dark:bg-[#0F172A]/60 border-gray-300 dark:border-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Doc.Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full h-10 px-3 rounded-md border text-sm transition-colors bg-white dark:bg-[#0F172A] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Starting Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (fieldErrors.startDate) setFieldErrors((p) => ({ ...p, startDate: "" }));
                }}
                className="w-full h-10 px-3 rounded-md border text-sm transition-colors bg-white dark:bg-[#0F172A] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
              {fieldErrors.startDate && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.startDate}</p>
              )}
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Ending Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (fieldErrors.endDate) setFieldErrors((p) => ({ ...p, endDate: "" }));
                }}
                className="w-full h-10 px-3 rounded-md border text-sm transition-colors bg-white dark:bg-[#0F172A] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
              {fieldErrors.endDate && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10" />

        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Calendar Details
          </h3>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate
          </button>
        </div>

        {detailRows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700 w-10">S.No</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">stdt</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">sno</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">Date For A Month</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">Day</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">Day Of Month</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">Month</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">Year</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">Month Year</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">Week No</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">nwkno</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">swkno</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-1.5 text-gray-500 dark:text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.stdt}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.sno}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.dateForMonth}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.day}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.dayOfMonth}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.month}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.year}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.monthYear}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.weekNo}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.nwkno}</td>
                    <td className="px-3 py-1.5 text-gray-900 dark:text-white">{row.swkno}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detailRows.length === 0 && startDate && endDate && !fieldErrors.endDate && (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-slate-400">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            Click <strong>Generate</strong> to create calendar rows
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-white/10" />

        <div className="flex justify-end gap-3">
          <button
            onClick={handleNew}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium border transition-colors bg-white dark:bg-transparent border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            New
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || detailRows.length === 0}
            className="flex items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium text-white transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarMaster;

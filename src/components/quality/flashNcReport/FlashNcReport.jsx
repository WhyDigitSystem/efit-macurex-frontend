import { useState } from "react";
import FlashNcReportForm from "./FlashNcReportForm";
import FlashNcReportList from "./FlashNcReportList";

const FlashNcReport = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedReport, setSelectedReport] = useState(null);
  const [editId, setEditId] = useState(null);

  const handleAddNew = () => {
    setSelectedReport(null);
    setEditId(null);
    setCurrentView("add");
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setEditId(report.id);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedReport(null);
    setEditId(null);
  };

  const handleSave = async () => {
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <FlashNcReportList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
        />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <FlashNcReportForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedReport}
          editId={editId}
        />
      )}
    </>
  );
};

export default FlashNcReport;

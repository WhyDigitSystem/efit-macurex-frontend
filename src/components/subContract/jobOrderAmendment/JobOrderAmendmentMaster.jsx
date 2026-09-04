import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobOrderAmendmentList from "./JobOrderAmendmentList";
import JobOrderAmendmentForm from "./JobOrderAmendmentForm";

const JobOrderAmendmentMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  /*
   * Pencil icon click -> open the form with just the row's id.
   *
   * JobOrderAmendmentForm fetches the full record itself via
   * jobOrderAmendmentAPI.getJobOrderAmendmentById(id) (same pattern as
   * the Tool Master form's fetchToolData), so we don't need to
   * re-fetch the whole org list here just to find one row — the list
   * row may not carry the full jobOrderAmendmentDetails[] anyway.
   */
  const handleEdit = (row) => {
    setEditData({ id: row.id });
    setView("form");
  };

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sub Contract module home.
  // (Form's back button goes back to the list via handleBack.)
  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return <JobOrderAmendmentForm data={editData} onBack={handleBack} />;
  }

  return (
    <JobOrderAmendmentList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default JobOrderAmendmentMaster;

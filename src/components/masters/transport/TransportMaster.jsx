import { useState } from "react";
import TransportMasterList from "./TransportMasterList";
import TransportMasterForm from "./TransportMasterForm";
import transportAPI from "../../../api/transportAPI";

const TransportMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = async (data) => {
    // Fetch full data by ID
    try {
      setLoading(true);
      // getTransportById already returns transportVO or null
      const fullData = await transportAPI.getTransportById(data.id);

      if (fullData) {
        setEditData(fullData);
      } else {
        // Fallback to the data from list view if API fails
        setEditData(data);
      }
      setScreen("form");
    } catch (error) {
      console.error("Error fetching transport details:", error);
      // Fallback to the data from list view
      setEditData(data);
      setScreen("form");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setScreen("list");
  };

  const handleSave = async (payload) => {
    try {
      await transportAPI.updateCreateTransport(payload);
      handleBack();
    } catch (error) {
      console.error("Error saving transport:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <TransportMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <TransportMasterForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </>
  );
};

export default TransportMaster;
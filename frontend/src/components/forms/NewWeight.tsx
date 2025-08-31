import React from "react";
import apiService from "../../services/apiService";
import { useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface NewWeightFormProps {
  editData?: {
    id: number;
    date: string;
    weight: number;
  };
  editingIndex: number;
}

const NewWeightForm: React.FC<NewWeightFormProps> = ({ editData, editingIndex }) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.createWeightEntry({
      ...data,
      person_id: location.state.guestId,
    });

    if (response.error) {
      alert("Log creation failed: " + response.error);
      return;
    }

    if (editData && editingIndex !== -1) {
      const deleteResponse = await apiService.deleteWeightEntry(editingIndex);
      if (deleteResponse.error) {
        alert("Log deletion failed: " + deleteResponse.error);
        return;
      }
    }

    window.location.reload();
  };

  const { user } = useUser();
  const location = useLocation();


  return (
    <form method="POST" onSubmit={handleSubmit}>
      <label>
        Data:
        <input
          type="date"
          name="date"
          required
          defaultValue={
            editData?.date
              ? new Date(editData.date).toISOString().split("T")[0]
              : ""
          }
        />
      </label>
      <label>
        Peso (kg):
        <input
          type="number"
          name="value"
          step="0.01"
          required
          defaultValue={editData?.weight || ""}
        />
      </label>
      <button type="submit">{editData ? "Aggiorna" : "Inserisci"}</button>
    </form>
  );
};

export default NewWeightForm;
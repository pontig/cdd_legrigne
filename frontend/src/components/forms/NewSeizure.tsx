import React from "react";
import apiService from "../../services/apiService";
import { useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface NewSeizureFormProps {
  editData?: {
    id: number;
    date: string;
    time: string;
    duration: string;
    notes?: string;
    signature: string;
  }
  editingIndex: number;
}

const NewSeizureForm: React.FC<NewSeizureFormProps> = ({ editData, editingIndex }) => {
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.createSeizure({
      ...data,
      person_id: location.state.guestId,
    });

    if (response.error) {
      alert("Log creation failed: " + response.error);
      return;
    }

    if (editData && editingIndex !== -1) {
      const deleteResponse = await apiService.deleteSeizure(editingIndex);
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
        Ora inizio:
        <input
          type="time"
          name="time"
          required
          defaultValue={
            editData?.time
              ? editData.time.padStart(5, '0')
              : ""
          }
        />
      </label>
      <label>
        Durata:
        <input type="text" name="duration" id="duration" required
          defaultValue={editData?.duration || ""} />
      </label>
      <label>
        Note:
        <textarea name="notes" defaultValue={editData?.notes || ""} />
      </label>
      <label>
        {/* Firma: */}
        <input
          type="hidden"
          name="signature"
          required
          value={
            editData?.signature ||
            (user?.name ? user.name[0].toLowerCase() : "") +
            (user?.surname ? user.surname[0].toLowerCase() : "")
          }
        />
      </label>
      <button type="submit">{editData ? "Aggiorna" : "Inserisci"}</button>
    </form>
  )

}

export default NewSeizureForm;
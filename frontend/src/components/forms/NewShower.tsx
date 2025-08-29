import React from "react";
import apiService from "../../services/apiService";
import { useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface NewShowerFormProps {
  editData?: {
    id: number;
    date: string;
    done: boolean;
    notes?: string;
    signature: string;
  }
  editingIndex: number;
}

const NewShowerForm: React.FC<NewShowerFormProps> = ({ editData, editingIndex }) => {
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.createShowerRecord({
      ...data,
      person_id: location.state.guestId,
    });

    if (response.error) {
      alert("Log creation failed: " + response.error);
      return;
    }

    if (editData && editingIndex !== -1) {
      const deleteResponse = await apiService.deleteShowerRecord(editingIndex);
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
    <form method='POST' onSubmit={handleSubmit}>
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
      <label htmlFor="done">
        <input
          type="checkbox"
          name="done"
          id="done"
          defaultChecked={editData?.done}
        />
        Effettuata
      </label>
      <label>
        Note:
        <textarea name="notes" defaultValue={editData?.notes || ""} />
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
      </label>
    </form>
  );
};

export default NewShowerForm;

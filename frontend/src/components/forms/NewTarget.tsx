import React from "react";
import { useUser } from "../../contexts/UserContext";
import { useLocation } from "react-router-dom";
import apiService from "../../services/apiService";

interface NewTargetFormProps {
  editData?: {
    date: string;
    event: string;
    intervention: string;
    signature: string;
  };
  editingIndex: number;
}

const NewTargetForm: React.FC<NewTargetFormProps> = ({ editData, editingIndex }) => {
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.createTargetEntry({
      ...data,
      person_id: location.state.guestId,
    });

    if (response.error) {
      alert("Target creation failed: " + response.error);
      return;
    }

    if (editData && editingIndex !== -1) {
      const deleteResponse = await apiService.deleteTargetEntry(editingIndex);
      if (deleteResponse.error) {
        alert("Target deletion failed: " + deleteResponse.error);
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
        Evento:
        <textarea name="event" required defaultValue={editData?.event || ""} />
      </label>
      <label>
        Intervento:
        <textarea
          name="intervention"
          defaultValue={editData?.intervention || ""}
        />
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
  );
};

export default NewTargetForm;

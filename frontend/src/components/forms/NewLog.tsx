import React from "react";
import { useUser } from "../../contexts/UserContext";

interface NewLogFormProps {
  editData?: {
    date: string;
    event: string;
    intervention: string;
    signature: string;
  };
}

const NewLogForm: React.FC<NewLogFormProps> = ({ editData }) => {
  const { user } = useUser();

  return (
    <form method="POST">
      <label>
        Data:
        <input type="date" name="date" defaultValue={editData?.date ? new Date(editData.date).toISOString().split('T')[0] : ""}  />
      </label>
      <label>
        Evento:
        <textarea name="event" defaultValue={editData?.event || ""} />
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
          value={
            editData?.signature ||
            (user?.name ? user.name[0] : "") +
              (user?.surname ? user.surname[0] : "")
          }
        />
      </label>
      <button type="submit">{editData ? "Aggiorna" : "Inserisci"}</button>
    </form>
  );
};

export default NewLogForm;

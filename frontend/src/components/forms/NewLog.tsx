import React, { useEffect } from "react";
import { useUser } from "../../contexts/UserContext";

const NewLogForm: React.FC = () => {

    const {user} = useUser();

  return (
    <form method="POST">
      <label>
        Data:
        <input type="date" name="date" />
      </label>
      <label>
        Evento:
        <textarea name="event" />
      </label>
      <label>
        Intervento:
        <textarea name="intervention" />
      </label>
      <label>
        {/* Firma: */}
        <input
          type="hidden"
          name="signature"
          value={
            (user?.name ? user.name[0] : "") +
            (user?.surname ? user.surname[0] : "")
          }
        />
      </label>
      <button type="submit">Inserisci</button>
    </form>
  );
};

export default NewLogForm;

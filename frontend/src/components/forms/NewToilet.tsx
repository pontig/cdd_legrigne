import React from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../../services/apiService';
import { useUser } from '../../contexts/UserContext';

interface NewToiletFormProps {
  editData?: {
    id: number;
    date: string;
    morning: boolean;
    urine: boolean;
    feces: boolean;
    diaper: number;
    redness: boolean;
    period: boolean;
    belt: boolean;
    signature: string;
  }
  editingIndex: number;
}

const NewToiletForm: React.FC<NewToiletFormProps> = ({ editData, editingIndex }) => {
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.createToiletRecord({
      ...data,
      person_id: location.state.guestId,
    });

    if (response.error) {
      alert("Log creation failed: " + response.error);
      return;
    }

    if (editData && editingIndex !== -1) {
      const deleteResponse = await apiService.deleteToiletRecord(editingIndex);
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
      <label htmlFor="morning-yes">
        <input
          type="radio"
          name="morning"
          id="morning-yes"
          value="yes"
          defaultChecked={editData?.morning}
        />
        Mattino
      </label>
      <label htmlFor="morning-no">
        <input
          type="radio"
          name="morning"
          id="morning-no"
          value="no"
          defaultChecked={!editData?.morning}
        />
        Pomeriggio
      </label>
      Urina
      <label htmlFor="urine-yes">
        <input
          type="radio"
          name="urine"
          id="urine-yes"
          value="yes"
          defaultChecked={editData?.urine}
        />
        Urina
      </label>
      <label htmlFor="urine-no">
        <input
          type="radio"
          name="urine"
          id="urine-no"
          value="no"
          defaultChecked={!editData?.urine}
        />
        No Urina
      </label>
      Defecazione
      <label htmlFor="feces-yes">
        <input
          type="radio"
          name="feces"
          id="feces-yes"
          value="yes"
          defaultChecked={editData?.feces}
        />
        Si
      </label>
      <label htmlFor="feces-no">
        <input
          type="radio"
          name="feces"
          id="feces-no"
          value="no"
          defaultChecked={!editData?.feces}
        />
        No
      </label>
      Pannolone
      <label htmlFor="diaper-dry">
        <input
          type="radio"
          name="diaper"
          id="diaper-dry"
          value="1"
          defaultChecked={editData?.diaper === 1}
        />
        Asciutto
      </label>
      <label htmlFor="diaper-wet">
        <input
          type="radio"
          name="diaper"
          id="diaper-wet"
          value="0"
          defaultChecked={editData?.diaper === 0}
        />
        Bagnato
      </label>
      <label htmlFor="diaper-none">
        <input
          type="radio"
          name="diaper"
          id="diaper-none"
          value="2"
          defaultChecked={editData?.diaper === null || !editData}
        />
        Nessuno
      </label>
      Altri controlli
      <label htmlFor="redness">
        <input
          type="checkbox"
          name="redness"
          id="redness"
          defaultChecked={editData?.redness}
        />
        Arrossamenti
      </label>
      <label htmlFor="period">
        <input
          type="checkbox"
          name="period"
          id="period"
          defaultChecked={editData?.period}
        />
        Ciclo
      </label>
      <label htmlFor="belt">
        <input
          type="checkbox"
          name="belt"
          id="belt"
          defaultChecked={editData?.belt}
        />
        Controllo cintura
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

export default NewToiletForm;

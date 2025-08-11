import React from "react";
import { useUser } from "../../contexts/UserContext";
import { useLocation } from "react-router-dom";
import apiService from "../../services/apiService";

interface NewActivityFormProps {
  mostFrequentAdesion: number;
  mostFrequentParticipation: number;
  mostFrequentMood: number;
  mostFrequentCommunication: number;
  missingDate?: string;
  editData?: {
    id: number;
    date: string;
    morning: boolean;
    activity: string;
    adesion: number;
    participation: number;
    mood: number;
    communication: number;
    problem_behaviour: boolean;
    activity_id: number;
  };
  editingIndex: number;
}

const NewActivityForm: React.FC<NewActivityFormProps> = ({
  mostFrequentAdesion,
  mostFrequentParticipation,
  mostFrequentMood,
  mostFrequentCommunication,
  missingDate,
  editData,
  editingIndex
}) => {
  const arr_adesion = [
    "Su insistenza",
    "Su invito",
    "Spontanea",
    "Su sua richiesta",
  ];
  const arr_participation = [
    "Rifiuto-Imposs",
    "Solo relazionale",
    "Svolge in parte",
    "Attiva",
  ];
  const arr_mood = [
    "Triste",
    "Apatico",
    "Tranquillo",
    "Umore altalenante",
    "Irrequieto",
    "Sovratono",
    "Intollerante",
    "Estraniato dalla realtà",
  ];
  const arr_comunication = [
    "Isolato",
    "Adeguata alla sua condizione",
    "Logorroico",
    "Eloquio ossesivo",
  ];

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.createActivity({
      ...data,
      person_id: location.state.guestId,
    });

    if (response.error) {
      alert("Activity creation failed: " + response.error);
      return;
    }

    if (editData) {
      const deleteResponse = await apiService.deleteActivity(editData.id);
      if (deleteResponse.error) {
        alert("Activity deletion failed: " + deleteResponse.error);
        return;
      }
    }

    window.location.reload();
  };

  const declareAbsence = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.declareAbsence({
      person_id: location.state.guestId,
      date: data.date as string,
    });

    if (response.error) {
      alert("Absence declaration failed: " + response.error);
      return;
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
          defaultValue={missingDate || editData?.date || ""}
          required
        />
      </label>
      <button type="submit" name="absent" style={{ marginBottom: "1rem" }} onClick={declareAbsence}>
        Assente tutto il giorno
      </button>
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
      <label>
        Attività:
        <select name="activity" defaultValue={editData?.activity_id || "0"}>
          <option value="0">01 - Attività Ricreativa</option>
          <optgroup label="02 - Attività Motoria">
            <option value="1">pi -Piscina</option>
            <option value="2">pa - Palestra</option>
            <option value="3">c - Cavallo</option>
          </optgroup>
          <optgroup label="03 - Attività Artigianale">
            <option value="4">f - Falegnameria</option>
            <option value="5">s - Sartoria</option>
            <option value="6">m - Midollino</option>
          </optgroup>
          <optgroup label="04 - Attività Artistica">
            <option value="7">aa -attività artistica</option>
            <option value="8">sa - sapone</option>
            <option value="31">at - arteterapia</option>
          </optgroup>
          <optgroup label="05 - Attività Culturale">
            <option value="9">gc - Gruppo C</option>
            <option value="10">cl - Classifica</option>
            <option value="11">co - Computer</option>
            <option value="12">ms - Mantenimento scolastico</option>
            <option value="13">al - Attività Ludica / di animazione</option>
          </optgroup>
          <optgroup label="06 - Attività Culinaria">
            <option value="14">cu - Cucina</option>
            <option value="15">pa - Pasticceria</option>
          </optgroup>
          <option value="16">07 - Ergoterapia</option>
          <option value="17">08 - Musica</option>
          <option value="18">09 - Psicomotricità</option>
          <optgroup label="10 - Uscita sul Territorio">
            <option value="19">sp - Spesa</option>
            <option value="20">g - Gita</option>
            <option value="21">p - Passeggiata o commissione</option>
          </optgroup>
          <option value="22">11 - Servizi comunitari</option>
          <option value="23">12 - Altro (specificare nel diario)</option>
          <option value="24">13 - Rilassamento</option>
          <option value="25">14 - Mantenimento motorio</option>
          <option value="26">15 - Giardinaggio / Orto</option>
          <option value="27">16 - Attività ludica di gruppo</option>
          <option value="28">17 - Scrittura</option>
          <option value="29">18 - Giochi Cognitivi</option>
          <option value="30">19 - Attività video/teatrale</option>
          <option value="32">20 - Beauty</option>
          <option value="33">21 - Relazione</option>
          <option value="34">22 - Relax / rilassamento</option>
          <option value="35">23 - Cineforum</option>
          <option value="100">** - Attività fuori Programmazione</option>
        </select>
      </label>
      <label>
        Adesione:
        <select
          name="adesion"
          defaultValue={editData?.adesion || mostFrequentAdesion}
        >
          {arr_adesion.map((option, index) => (
            <option key={option} value={index + 1}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Partecipazione:
        <select
          name="participation"
          defaultValue={editData?.participation || mostFrequentParticipation}
        >
          {arr_participation.map((option, index) => (
            <option key={option} value={index + 1}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Umore:
        <select name="mood" defaultValue={editData?.mood || mostFrequentMood}>
          {arr_mood.map((option, index) => (
            <option key={option} value={index + 1}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Comunicazione:
        <select
          name="communication"
          defaultValue={editData?.communication || mostFrequentCommunication}
        >
          {arr_comunication.map((option, index) => (
            <option key={option} value={index + 1}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          name="problem_behaviour"
          defaultChecked={editData?.problem_behaviour}
        />
        ha avuto un comportamento problema
      </label>
      <button type="submit">{editData ? "Aggiorna" : "Inserisci"}</button>
    </form>
  );
};

export default NewActivityForm;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftBar from "../components/LeftBar";
import { FaPencilAlt, FaPlus, FaPrint } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCaretBackOutline } from "react-icons/io5";
import GenericForm from "../components/GenericForm";
import NewLogForm from "../components/forms/NewLog";

interface Event {
  date: string;
  event: string;
  intervention: string;
  signature: string;
}

const Template: React.FC = () => {
  // API services
  const api = {
    baseUrl: "/be",

    // async foo(): Promise<void> ...
  };

  // Navigation and state
  const navigate = useNavigate();
  const location = useLocation();
  const [guestId, setGuestId] = useState<number>(-1);
  const [guestFullName, setGuestFullName] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);

  // Effects
  useEffect(() => {
    setGuestId(location.state.guestId);
    setGuestFullName(location.state.name + " " + location.state.surname);
  }, [location.state]);

  // Functions and other hooks

  // Return

  // MOCKUP
  React.useEffect(() => {
    setEvents([
      {
        date: "2023-10-01",
        event: "Arrivo presso la struttura e accoglienza iniziale",
        intervention:
          "Supporto logistico e presentazione delle regole della casa",
        signature: "Firma1",
      },
      {
        date: "2023-10-02",
        event: "Colazione e attività di socializzazione con gli altri ospiti",
        intervention:
          "Assistenza nella preparazione dei pasti e monitoraggio delle interazioni",
        signature: "Firma2",
      },
      {
        date: "2023-10-03",
        event: "Passeggiata nel parco e attività motoria",
        intervention:
          "Supervisione costante e supporto durante l'esercizio fisico",
        signature: "Firma3",
      },
      {
        date: "2023-10-04",
        event: "Laboratorio creativo di pittura",
        intervention:
          "Fornitura materiali, incoraggiamento e aiuto nella gestione delle emozioni",
        signature: "Firma4",
      },
      {
        date: "2023-10-05",
        event: "Visita medica di controllo",
        intervention:
          "Accompagnamento dal medico e gestione della documentazione sanitaria",
        signature: "Firma5",
      },
      {
        date: "2023-10-06",
        event: "Attività di lettura e discussione di gruppo",
        intervention:
          "Facilitazione della conversazione e supporto alla comprensione dei testi",
        signature: "Firma6",
      },
    ]);
  }, []);

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Nuova registrazione",
            action: () => setFormIsShown(true),
            icon: <FaPlus />,
          },
          {
            title: "Stampa questa pagina",
            action: () => {},
            icon: <FaPrint />,
          },
          {
            title: "Modifica registrazione",
            action: () => {},
            icon: <FaPencilAlt />,
          },
          {
            title: "Elimina registrazione",
            action: () => {},
            icon: <RiDeleteBin6Line />,
            color: "#f22",
          },
          {
            title: "Indietro",
            action: () => {
              navigate(-1);
            },
            icon: <IoCaretBackOutline />,
          },
        ]}
      />
      <div>
        <div className="header">
          <h1>Diario di {guestFullName}</h1>
        </div>
        <table className="wide-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Evento</th>
              <th>Intervento</th>
              <th>Firma</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td>{event.date}</td>
                <td>{event.event}</td>
                <td>{event.intervention}</td>
                <td>{event.signature}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {formIsShown && (
          <GenericForm
            title="Nuovo evento"
            closeForm={() => setFormIsShown(false)}
          >
            <NewLogForm />
          </GenericForm>
        )}
      </div>
    </div>
  );
};

export default Template;

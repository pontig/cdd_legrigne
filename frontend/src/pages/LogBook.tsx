import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftBar from "../components/LeftBar";
import { FaPencilAlt, FaPlus, FaPrint } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCaretBackOutline } from "react-icons/io5";
import GenericForm from "../components/GenericForm";
import NewLogForm from "../components/forms/NewLog";
import { useUser } from "../contexts/UserContext";

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
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [guestId, setGuestId] = useState<number>(-1);
  const [guestFullName, setGuestFullName] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1); // Index of event being edited - will be used when saving changes

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
        date: "2025-07-22",
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
            action: () => {
              setEditingEvent(null);
              setEditingIndex(-1);
              setFormIsShown(true);
            },
            icon: <FaPlus />,
          },
          {
            title: "Stampa questa pagina",
            action: () => window.print(),
            icon: <FaPrint />,
          },
          {
            title: "Modifica registrazione",
            action: () => setEditMode(!editMode),
            icon: <FaPencilAlt />,
            disabled: (user?.permissions ?? 0) > 20 ? false : true, // TODO: non ricordo come è la dinamica precisa per ste cose
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
              {editMode && <th>Azioni</th>}
              <th>Data</th>
              <th>Evento</th>
              <th>Intervento</th>
              <th>Firma</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                {editMode && (
                  <td>
                    <div className="action-buttons">
                      {editMode &&
                        (() => {
                          // Calculate date range: past Monday to next Friday
                          const today = new Date();
                          const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
                          const monday = new Date(today);
                          monday.setDate(
                            today.getDate() - ((dayOfWeek + 6) % 7)
                          ); // Past Monday
                          const friday = new Date(monday);
                          friday.setDate(monday.getDate() + 4); // Next Friday

                          const eventDate = new Date(event.date);

                          const isInRange =
                            eventDate >= monday && eventDate <= friday;

                          if ((user && user.permissions > 20) || isInRange) {
                            return (
                              <>
                                <button
                                  className="edit-row-btn"
                                  onClick={() => {
                                    setEditingEvent(event);
                                    setEditingIndex(index);
                                    setFormIsShown(true);
                                    setEditMode(false); // Exit edit mode after selecting an item
                                  }}
                                  title="Modifica questa registrazione"
                                >
                                  <FaPencilAlt />
                                </button>
                                <button
                                  className="delete-row-btn"
                                  onClick={() => {
                                    // TODO: Implement delete functionality
                                    console.log(
                                      `Delete event at index ${index}`
                                    );
                                  }}
                                  title="Elimina questa registrazione"
                                >
                                  <RiDeleteBin6Line />
                                </button>
                              </>
                            );
                          } else {
                            return <span>N/A</span>;
                          }
                        })()}
                    </div>
                  </td>
                )}
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
            title={editingEvent ? "Modifica evento" : "Nuovo evento"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingEvent(null);
              setEditingIndex(-1);
            }}
          >
            <NewLogForm editData={editingEvent || undefined} />
          </GenericForm>
        )}
      </div>
    </div>
  );
};

export default Template;

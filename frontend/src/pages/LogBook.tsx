import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftBar from "../components/LeftBar";
import { FaPencilAlt, FaPlus, FaPrint } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCaretBackOutline } from "react-icons/io5";
import GenericForm from "../components/GenericForm";
import NewLogForm from "../components/forms/NewLog";
import { useUser } from "../contexts/UserContext";
import { usePlace } from "../contexts/PlaceContext";
import { useSemester } from "../contexts/SemesterContext";

interface Event {
  id: number;
  date: string;
  event: string;
  intervention: string;
  signature: string;
}

const Template: React.FC = () => {
  // API services
  const api = {
    baseUrl: "http://localhost:5000",

    async fetchEvents(): Promise<void> {
      try {
        const response = await fetch(
          `${api.baseUrl}/logbook?person_id=` + location.state.guestId,
          {
            credentials: "include",
          }
        );
        if (response.status === 401) {
          console.error("Unauthorized access - please log in.");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = (await response.json()) as Event[];
        setEvents(data);
      } catch (error) {
        console.error("API call failed: " + error);
      }
    },
  };

  // Navigation and state
  const { user, setUser } = useUser();
  const {
    semesterString,
    semesterNumber,
    setSemesterString,
    setSemesterNumber,
  } = useSemester();
  const { place, setPlace } = usePlace();
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

  useEffect(() => {
    api.fetchEvents();
  }, []);

  // Functions and other hooks

  // Return
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
            disabled: semesterString !== null,
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
            disabled: semesterString !== null || (user?.permissions ?? 0) < 20,
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
          <p className="subtitle">{semesterString}</p>
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
              <tr key={event.id}>
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

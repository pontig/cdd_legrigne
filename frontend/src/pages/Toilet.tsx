import React, { useEffect, useState } from "react";
import LeftBar from "../components/LeftBar";
import { usePlace } from "../contexts/PlaceContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useSemester } from "../contexts/SemesterContext";
import { IoCaretBackOutline } from "react-icons/io5";
import { FaCheck, FaPencilAlt, FaPlus, FaPrint, FaTimes } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdNotInterested } from "react-icons/md";
import NewToiletForm from "../components/forms/NewToilet";
import GenericForm from "../components/GenericForm";
import apiService from "../services/apiService";

interface ToiletRecord {
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

const Toilet: React.FC = () => {
  const fetchEvents = async (): Promise<void> => {
    const response = await apiService.fetchToiletRecords({
      person_id: location.state.guestId,
    });

    if (response.status === 401) {
      console.error("Unauthorized access - please log in.");
      navigate("/login");
      return;
    }

    if (response.error) {
      console.error("API call failed:", response.error);
      return;
    }

    if (response.data) {
      setEvents(response.data as ToiletRecord[]);
    }
  };
  const deleteEvent = async (id: number): Promise<void> => {
    const conf = window.confirm("Sei sicuro di voler eliminare questa voce?");

    if (!conf) return;

    const response = await apiService.deleteToiletRecord(id);

    if (response.status === 401) {
      console.error("Unauthorized access - please log in.");
      navigate("/login");
      return;
    }

    if (response.error) {
      console.error("API call failed:", response.error);
      return;
    }

    if (response.data) {
      fetchEvents();
    }
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
  const [events, setEvents] = useState<ToiletRecord[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ToiletRecord | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1); // Index of event being edited - will be used when saving changes

  // Effects
  useEffect(() => {
    setGuestId(location.state.guestId);
    setGuestFullName(location.state.name + " " + location.state.surname);
  }, [location.state]);

  useEffect(() => {
    fetchEvents();
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
            disabled: semesterString !== null,
          },
          {
            title: "Stampa questa pagina",
            action: () => {
              window.scrollTo({ top: 0 });
              window.print();
            },
            icon: <FaPrint />,
          },
          {
            title: "Aggiorna",
            action: () => setEditMode(!editMode),
            icon: <FaPencilAlt />,
            disabled: semesterString !== null,
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
          <h1>Scheda bagno di {guestFullName}</h1>
          <p className="subtitle">{semesterString}</p>
        </div>
        <table className="wide-table">
          <thead>
            <tr>
              {editMode && <th>Azioni</th>}
              <th>Data</th>
              <th>Urina</th>
              <th>Defecazione</th>
              <th>Pannolone</th>
              <th>Arrossamenti</th>
              <th>Ciclo</th>
              <th>Cintura</th>
              <th>Firma</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", fontStyle: "italic" }}
                >Nessun evento registrato</td>
              </tr>
            ) : (
              events.map((event, index) => (
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
                              today.getDate() - ((dayOfWeek + 7) % 7)
                            ); // Past Monday
                            const friday = new Date(monday);
                            friday.setDate(monday.getDate() + 5); // Next Friday

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
                                      setEditingIndex(event.id);
                                      setFormIsShown(true);
                                      setEditMode(false);
                                      console.log(event)
                                    }}
                                    title="Modifica questa registrazione"
                                  >
                                    <FaPencilAlt />
                                  </button>
                                  <button
                                    className="delete-row-btn"
                                    onClick={() => deleteEvent(event.id)}
                                    title="Elimina questa registrazione"
                                  >
                                    <RiDeleteBin6Line />
                                  </button>
                                </>
                              );
                            } else {
                              return <span><MdNotInterested /></span>;
                            }
                          })()}
                      </div>
                    </td>
                  )}
                  <td className="no-wrap">{event.date} {event.morning ? " (m)" : " (p)"}</td>
                  <td className="centered">{event.urine ? "Sì" : "No"}</td>
                  <td className="centered">{event.feces ? "Sì" : "No"}</td>
                  <td>{event.diaper != null ? (event.diaper ? "Asciutto" : "Bagnato") : "Nessuno"}</td>
                  <td className="centered">{event.redness ? <FaCheck /> : ""}</td>
                  <td className="centered">{event.period ? <FaCheck /> : ""}</td>
                  <td className="centered">{event.belt ? <FaCheck /> : ""}</td>
                  <td className="signature-td">{event.signature}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {formIsShown && (
          <GenericForm
            title={editingEvent ? "Aggiorna bagno" : "Nuova registrazione bagno"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingEvent(null);
              setEditingIndex(-1);
            }}
          >
            <NewToiletForm
              editData={editingEvent || undefined}
              editingIndex={editingIndex || -1}
            />
          </GenericForm>
        )}
      </div>
    </div>
  );
};

export default Toilet;

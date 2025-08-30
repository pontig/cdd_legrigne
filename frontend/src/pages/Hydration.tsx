import React, { useEffect, useState } from "react";
import LeftBar from "../components/LeftBar";
import { usePlace } from "../contexts/PlaceContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useSemester } from "../contexts/SemesterContext";
import { IoCaretBackOutline } from "react-icons/io5";
import { FaCheck, FaPencilAlt, FaPlus, FaPrint } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdNotInterested } from "react-icons/md";
import GenericForm from "../components/GenericForm";
import apiService from "../services/apiService";
import NewHydrationForm from "../components/forms/NewHydration";

interface HydrationRecord {
  id: number;
  date: string;
  done: boolean;
  notes?: string;
  signature: string;
}

const Hydration: React.FC = () => {

  const fetchHydrations = async (): Promise<void> => {
    const response = await apiService.fetchHydrationRecords({
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
      setHydrations(response.data as HydrationRecord[]);
    }
  };
  const deleteHydration = async (id: number): Promise<void> => {
    const conf = window.confirm("Sei sicuro di voler eliminare questa voce?");

    if (!conf) return;

    const response = await apiService.deleteHydrationRecord(id);

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
      fetchHydrations();
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
  const [hydrations, setHydrations] = useState<HydrationRecord[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingHydration, setEditingHydration] = useState<HydrationRecord | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // Effects
  useEffect(() => {
    setGuestId(location.state.guestId);
    setGuestFullName(location.state.name + " " + location.state.surname);
  }, [location.state]);

  useEffect(() => {
    fetchHydrations();
  }, []);

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Nuova registrazione",
            action: () => {
              setEditingHydration(null);
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
            title: "Modifica registrazione",
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
          <h1>Scheda idratazione di {guestFullName}</h1>
          <p className="subtitle">{semesterString}</p>
        </div>
        <table className="wide-table">
          <thead>
            <tr>
              {editMode && <th>Azioni</th>}
              <th>Data</th>
              <th>Effettuata</th>
              <th>Note</th>
              <th>Firma</th>
            </tr>
          </thead>
          <tbody>
            {hydrations.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", fontStyle: "italic" }}
                >Nessun evento registrato</td>
              </tr>
            ) : (
              hydrations.map((event, index) => (
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
                                      setEditingHydration(event);
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
                                    onClick={() => deleteHydration(event.id)}
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
                  <td className="no-wrap">{event.date}</td>
                  <td className="centered">{event.done ? <FaCheck /> : ""}</td>
                  <td>{event.notes}</td>
                  <td className="signature-td">{event.signature}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {formIsShown && (
          <GenericForm
            title={editingHydration ? "Modifica registrazione bagno" : "Nuova registrazione bagno"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingHydration(null);
              setEditingIndex(-1);
            }}
          >
            <NewHydrationForm
              editData={editingHydration || undefined}
              editingIndex={editingIndex || -1}
            />
          </GenericForm>
        )}
      </div>
    </div>
  )
}

export default Hydration;
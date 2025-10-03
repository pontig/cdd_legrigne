import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftBar from "../components/LeftBar";
import { FaPencilAlt, FaPlus, FaPrint, FaTable } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCaretBackOutline } from "react-icons/io5";
import GenericForm from "../components/GenericForm";
import { useUser } from "../contexts/UserContext";
import { usePlace } from "../contexts/PlaceContext";
import { useSemester } from "../contexts/SemesterContext";
import apiService from "../services/apiService";
import { MdNotInterested } from "react-icons/md";
import NewVitalForm from "../components/forms/NewVital";
import { ImStatsBars } from "react-icons/im";

interface VitalEntry {
  id: number;
  date: string;
  max_pressure: number;
  min_pressure: number;
  heart_rate: number;
  temperature: number;
  saturation: number;
}

const Vital: React.FC = () => {
  const fetchVitals = async (): Promise<void> => {
    setIsLoading(true);
    const response = await apiService.fetchVitalEntries({
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
      const data = response.data as any
      setVitals(data.vitals as VitalEntry[]);
      setGraph(data.plot_image as any);
    }
    setIsLoading(false);
  };

  const deleteVital = async (id: number): Promise<void> => {
    const conf = window.confirm("Sei sicuro di voler eliminare questa voce?");

    if (!conf) return;

    const response = await apiService.deleteVitalEntry(id);
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
      fetchVitals();
    }
  }

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
  const [vitals, setVitals] = useState<VitalEntry[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingVital, setEditingVital] = useState<VitalEntry | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [graph, setGraph] = useState<any>(null);
  const [graphIsShown, setGraphIsShown] = useState<boolean>(false);



  // Effects
  useEffect(() => {
    setGuestId(location.state.guestId);
    setGuestFullName(location.state.name + " " + location.state.surname);
  }, [location.state]);

  useEffect(() => {
    fetchVitals();
  }, []);

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Nuova registrazione",
            action: () => {
              setEditingVital(null);
              setEditingIndex(-1);
              setFormIsShown(true);
            },
            icon: <FaPlus />,
            disabled: semesterString !== null,
          },
          {
            title: graphIsShown ? "Visualizza tabella" : "Visualizza grafico",
            action: () => setGraphIsShown(!graphIsShown),
            icon: graphIsShown ? <FaTable /> : <ImStatsBars />,
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
          <h1>Parametri vitali di {guestFullName}</h1>
          <p className="subtitle">{semesterString}</p>
        </div>
        {!graphIsShown ? (<table className="wide-table">
          <thead>
            <tr>
              {editMode && <th>Azioni</th>}
              <th>Data</th>
              <th>Max</th>
              <th>Min</th>
              <th>Freq</th>
              <th>Temp</th>
              <th>Sat</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={editMode ? 7 : 6} className="centered">
                  <em>Caricamento...</em>
                </td>
              </tr>

            ) : vitals.length === 0 ? (
              <tr>
                <td colSpan={editMode ? 7 : 6} className="centered">
                  <em>Nessun dato</em>
                </td>
              </tr>
            ) : (
              vitals.map((vital) => (
                <tr key={vital.id}>
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

                            const vitalDate = new Date(vital.date);

                            const isInRange =
                              vitalDate >= monday &&
                              vitalDate <= friday;

                            if (
                              (user && user.permissions > 20) ||
                              isInRange
                            ) {
                              return (
                                <>
                                  <button
                                    className="edit-row-btn"
                                    onClick={() => {
                                      setEditingVital(vital);
                                      console.log(vital)
                                      setEditingIndex(vital.id);
                                      setFormIsShown(true);
                                      setEditMode(false);
                                    }}
                                    title="Modifica questa registrazione"
                                  >
                                    <FaPencilAlt />
                                  </button>
                                  <button
                                    className="delete-row-btn"
                                    onClick={() => deleteVital(vital.id)}
                                    title="Elimina questa registrazione"
                                  >
                                    <RiDeleteBin6Line />
                                  </button>
                                </>
                              );
                            } else {
                              return (
                                <span>
                                  <MdNotInterested />
                                </span>
                              );
                            }
                          })()}
                      </div>
                    </td>
                  )}
                  <td className="no-wrap">
                    {vital.date}
                  </td>
                  <td>{vital.max_pressure}</td>
                  <td>{vital.min_pressure}</td>
                  <td>{vital.heart_rate}</td>
                  <td>{vital.temperature}</td>
                  <td>{vital.saturation}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>) :
          (<img className="pressure-graph" src={`data:image/png;base64,${graph}`} alt="Vital Graph" />)}
        {formIsShown && (
          <GenericForm
            title={editingVital ? "Modifica peso" : "Nuova registrazione"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingVital(null);
              setEditingIndex(-1);
            }}
          >
            <NewVitalForm
              editData={editingVital || undefined}
              editingIndex={editingIndex || -1}
            />
          </GenericForm>
        )}
      </div>
    </div>
  )

}

export default Vital;
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftBar from "../components/LeftBar";
import { FaPencilAlt, FaPlus, FaPrint } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCaretBackOutline } from "react-icons/io5";
import GenericForm from "../components/GenericForm";
import { useUser } from "../contexts/UserContext";
import { usePlace } from "../contexts/PlaceContext";
import { useSemester } from "../contexts/SemesterContext";
import apiService from "../services/apiService";
import { MdNotInterested } from "react-icons/md";
import NewWeightForm from "../components/forms/NewWeight";

interface WeightEntry {
  id: number;
  date: string;
  weight: number;
}

const Weight: React.FC = () => {
  const fetchWeights = async (): Promise<void> => {
    setIsLoading(true);
    const response = await apiService.fetchWeightEntries({
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
      setWeights(data.weights as WeightEntry[]);
      setGraph(data.plot_image as any);
    }
    setIsLoading(false);
  };

  const deleteWeight = async (id: number): Promise<void> => {
    const conf = window.confirm("Sei sicuro di voler eliminare questa voce?");

    if (!conf) return;

    const response = await apiService.deleteWeightEntry(id);
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
      fetchWeights();
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
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [graph, setGraph] = useState<any>(null);


  // Effects
  useEffect(() => {
    setGuestId(location.state.guestId);
    setGuestFullName(location.state.name + " " + location.state.surname);
  }, [location.state]);

  useEffect(() => {
    fetchWeights();
  }, []);

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Nuova registrazione",
            action: () => {
              setEditingWeight(null);
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
          <h1>Pesi di {guestFullName}</h1>
          <p className="subtitle">{semesterString}</p>
        </div>
        <table className="thin-table">
          <thead>
            <tr>
              {editMode && <th>Azioni</th>}
              <th>Data</th>
              <th>Peso (kg)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={editMode ? 3 : 2} className="centered">
                  <em>Caricamento...</em>
                </td>
              </tr>

            ) : weights.length === 0 ? (
              <tr>
                <td colSpan={editMode ? 3 : 2} className="centered">
                  <em>Nessun dato</em>
                </td>
              </tr>
            ) : (
              weights.map((weight) => (
                <tr key={weight.id}>
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

                            const weightDate = new Date(weight.date);

                            const isInRange =
                              weightDate >= monday &&
                              weightDate <= friday;

                            if (
                              (user && user.permissions > 20) ||
                              isInRange
                            ) {
                              return (
                                <>
                                  <button
                                    className="edit-row-btn"
                                    onClick={() => {
                                      setEditingWeight(weight);
                                      setEditingIndex(weight.id);
                                      setFormIsShown(true);
                                      setEditMode(false);
                                    }}
                                    title="Modifica questa registrazione"
                                  >
                                    <FaPencilAlt />
                                  </button>
                                  <button
                                    className="delete-row-btn"
                                    onClick={() => deleteWeight(weight.id)}
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
                    {weight.date}
                  </td>
                  <td>{weight.weight}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <img className="always-visible-graph" src={`data:image/png;base64,${graph}`} alt="Weight Graph" />
        {formIsShown && (
          <GenericForm
            title={editingWeight ? "Modifica peso" : "Nuova registrazione"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingWeight(null);
              setEditingIndex(-1);
            }}
          >
            <NewWeightForm
              editData={editingWeight || undefined}
              editingIndex={editingIndex || -1}
            />
          </GenericForm>
        )}
      </div>
    </div>
  )

}

export default Weight;
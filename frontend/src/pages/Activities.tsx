import React, { act, useEffect, useState } from "react";
import LeftBar from "../components/LeftBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { FaPencilAlt, FaPlus, FaPrint, FaTable } from "react-icons/fa";
import {
  IoCaretBackOutline,
  IoCheckmarkDoneCircleSharp,
} from "react-icons/io5";
import { ImStatsBars } from "react-icons/im";
import { RiDeleteBin6Line } from "react-icons/ri";
import GenericForm from "../components/GenericForm";
import NewActivityForm from "../components/forms/NewActivity";
import "../styles/activities.css";
import { useSemester } from "../contexts/SemesterContext";

interface Activity {
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
}

const Activities: React.FC = () => {
  // API services
  const api = {
    baseUrl: "http://localhost:5000",

    async fetchActivities(personId: number): Promise<void> {
      try {
        const response = await fetch(
          `${api.baseUrl}/activities?person_id=${personId}`,
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
        const data = await response.json();
        const retr_activities = data.activities as Activity[];
        setActivities(retr_activities);
        setGraph(data.plot_image);

        const lastActivity = retr_activities[retr_activities.length - 1];
        setMostFrequentAdesion(lastActivity.adesion);
        setMostFrequentParticipation(lastActivity.participation);
        setMostFrequentMood(lastActivity.mood);
        setMostFrequentCommunication(lastActivity.communication);
      } catch (error) {
        console.error("API call failed: " + error);
      }
    },
  };

  // Navigation and state
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
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    semesterString,
    semesterNumber,
    setSemesterString,
    setSemesterNumber,
  } = useSemester();
  const [guestId, setGuestId] = useState<number>(-1);
  const [guestFullName, setGuestFullName] = useState<string>("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formIsShown, setFormIsShown] = useState<boolean>(false);
  const [graphIsShown, setGraphIsShown] = useState<boolean>(false);
  const [editMode, setEditMode] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1); // Index of activity being edited - will be used when saving changes
  const [graph, setGraph] = useState<any>(null); // Placeholder for graph data, if needed
  const [missingActivityDate, setMissingActivityDate] = useState<
    string | undefined
  >(undefined);

  // Most frequent of the four arrays
  const [mostFrequentAdesion, setMostFrequentAdesion] = useState<number>(-1);
  const [mostFrequentParticipation, setMostFrequentParticipation] =
    useState<number>(-1);
  const [mostFrequentMood, setMostFrequentMood] = useState<number>(-1);
  const [mostFrequentCommunication, setMostFrequentCommunication] =
    useState<number>(-1);

  // Effects
  useEffect(() => {
    console.log(location.state);
    setGuestId(location.state.guestId);
    setGuestFullName(location.state.name + " " + location.state.surname);
    api.fetchActivities(location.state.guestId);
    console.log(location.state.missing_activity);
    if (location.state.missing_activity) {
      setMissingActivityDate(
        String(
          new Date().getFullYear() +
            "-" +
            String(location.state.missing_activity.month_int).padStart(2, "0") +
            "-" +
            String(location.state.missing_activity.day).padStart(2, "0")
        )
      );
      setFormIsShown(true);
    }
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFormIsShown(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
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
              setEditingActivity(null);
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
          <h1>Partecipazione attività di {guestFullName}</h1>
          <p className="subtitle">{semesterString}</p>
        </div>
        {!graphIsShown ? (
          <table className="wide-table">
            <thead>
              <tr>
                {editMode && <th>Azioni</th>}
                <th>Data</th>
                <th>Attività</th>
                <th>Adesione</th>
                <th>Partecipazione</th>
                <th>Umore</th>
                <th>Comunicazione</th>
                <th className="small centered">C. prob</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity.id}>
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

                            const activityDate = new Date(activity.date);

                            const isInRange =
                              activityDate >= monday && activityDate <= friday;

                            if ((user && user.permissions > 20) || isInRange) {
                              return (
                                <>
                                  {activity.activity !== null && (
                                    <button
                                      className="edit-row-btn"
                                      onClick={() => {
                                        setEditingActivity(activity);
                                        setEditingIndex(index);
                                        setFormIsShown(true);
                                        setEditMode(false); // Exit edit mode after selecting an item
                                      }}
                                      title="Modifica questa registrazione"
                                    >
                                      <FaPencilAlt />
                                    </button>
                                  )}
                                  <button
                                    className="delete-row-btn"
                                    onClick={() => {
                                      // TODO: Implement delete functionality
                                      console.log(
                                        `Delete activity at index ${index}`
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
                  <td>
                    {activity.date} {activity.morning ? " (m)" : " (p)"}
                  </td>
                  <td>{activity.activity}</td>
                  {activity.activity === null ? (
                    <td colSpan={editMode ? 6 : 5} className="centered">
                      <strong>ASSENTE</strong>
                    </td>
                  ) : (
                    <>
                      <td>
                        {activity.adesion}-{arr_adesion[activity.adesion - 1]}
                      </td>
                      <td>
                        {activity.participation}-
                        {arr_participation[activity.participation - 1]}
                      </td>
                      <td>
                        {activity.mood}-{arr_mood[activity.mood - 1]}
                      </td>
                      <td>
                        {activity.communication}-
                        {arr_comunication[activity.communication - 1]}
                      </td>
                      <td className="centered">
                        {activity.problem_behaviour ? (
                          <IoCheckmarkDoneCircleSharp />
                        ) : null}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="graph-container">
            <img
              src={`data:image/png;base64,${graph}`}
              alt="Activities Graph"
            />
            <div className="legend">
              <h3>Legenda</h3>
              <div>
                <div>
                  <b>Adesione:</b>
                  <ol>
                    {arr_adesion.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <b>Partecipazione:</b>
                  <ol>
                    {arr_participation.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
        {formIsShown && (
          <GenericForm
            title={editingActivity ? "Modifica attività" : "Nuova attività"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingActivity(null);
              setEditingIndex(-1);
              console.log(editingActivity);
            }}
          >
            <NewActivityForm
              editData={editingActivity || undefined}
              mostFrequentAdesion={mostFrequentAdesion}
              mostFrequentParticipation={mostFrequentParticipation}
              mostFrequentMood={mostFrequentMood}
              mostFrequentCommunication={mostFrequentCommunication}
              missingDate={
                location.state.missing_activity
                  ? missingActivityDate
                  : undefined
              }
            />
          </GenericForm>
        )}
      </div>
    </div>
  );
};

export default Activities;

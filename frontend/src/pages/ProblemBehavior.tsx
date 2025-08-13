import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { usePlace } from "../contexts/PlaceContext";
import { useSemester } from "../contexts/SemesterContext";
import { useLocation, useNavigate } from "react-router-dom";
import LeftBar from "../components/LeftBar";
import { IoCaretBackOutline } from "react-icons/io5";
import { FaPencilAlt, FaPlus, FaPrint, FaTable } from "react-icons/fa";
import { PiTextAaBold } from "react-icons/pi";

import "../styles/problembehavior.css";
import GenericForm from "../components/GenericForm";
import NewProblemBehaviorForm from "../components/forms/NewProblemBehavior";
import { RiDeleteBin6Line } from "react-icons/ri";
import apiService from "../services/apiService";

interface ProblemRecord {
  id: number;
  date: string;
  intensity: string;
  duration: string;
  cause: string;
  containment: string;
  signature: string;
  problem_statuses: boolean[];
}

interface ProblemItem {
  classe: string;
  id: number;
  nome: string;
}

interface Problem {
  [key: string]: ProblemItem[];
}

const ProblemBehavior: React.FC = () => {
  const fetchProblemBehavior: () => Promise<void> = async () => {
    const response = await apiService.fetchProblemBehaviors({
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
      const data = response.data as any;
      setProblemRecords(data.behaviors as ProblemRecord[]);
      setProblems(data.problems as Problem);
    }
  };

  const deleteProblemRecord = async (id: number): Promise<void> => {
    const conf = window.confirm(
      "Sei sicuro di voler eliminare questa registrazione?"
    );

    if (!conf) return;

    const response = await apiService.deleteProblemBehavior(id);

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
      fetchProblemBehavior();
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
  const [problemRecords, setProblemRecords] = useState<ProblemRecord[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingProblemRecord, setEditingProblemRecord] =
    useState<ProblemRecord | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1); // Index of event being edited - will be used when saving changes
  const [problems, setProblems] = useState<Problem>({});
  const [textIsShown, setTextIsShown] = useState<boolean>(false);

  // Effects
  useEffect(() => {
    fetchProblemBehavior();
    setGuestFullName(location.state.name + " " + location.state.surname);
    const style = document.createElement("style");
    style.type = "text/css";
    style.media = "print";
    style.innerHTML = `
      @media print {
        @page {
          size: portrait;
        }
        .longer-header {
          display: initial;
        }
        .longer-header h1 {
          margin: 0 !important;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const generateColorGradient = (
    startColor: string,
    endColor: string,
    steps: number
  ): string[] => {
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [0, 0, 0];
    };

    const rgbToHex = (r: number, g: number, b: number): string => {
      return (
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("")
      );
    };

    const [startR, startG, startB] = hexToRgb(startColor);
    const [endR, endG, endB] = hexToRgb(endColor);

    const colors: string[] = [];
    for (let i = 0; i < steps; i++) {
      const ratio = steps === 1 ? 0 : i / (steps - 1);
      const r = startR + (endR - startR) * ratio;
      const g = startG + (endG - startG) * ratio;
      const b = startB + (endB - startB) * ratio;
      colors.push(rgbToHex(r, g, b));
    }
    return colors;
  };

  // Generate colors for problem class headers
  const problemClassKeys = Object.keys(problems);
  const headerColors = generateColorGradient(
    "#006b99",
    "#005073",
    problemClassKeys.length
  );

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Nuova registrazione",
            action: () => {
              setEditingProblemRecord(null);
              setEditingIndex(-1);
              setFormIsShown(true);
            },
            icon: <FaPlus />,
            disabled: semesterString !== null,
          },
          {
            title: textIsShown ? "Visualizza tabella" : "Versione testuale",
            action: () => setTextIsShown(!textIsShown),
            icon: textIsShown ? <FaTable /> : <PiTextAaBold />,
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
        <div className="header longer-header">
          <h1>Comportamenti problema di {guestFullName}</h1>
          <p className="subtitle">{semesterString}</p>
        </div>
        {!textIsShown ? (
          <table className="wide-table problem-behavior-table">
            <thead>
              <tr>
                {editMode && (
                  <th className="ttl" rowSpan={3}>
                    Azioni
                  </th>
                )}
                <th className={!editMode ? "ttl" : ""} rowSpan={3}>
                  Data
                </th>
                <th
                  colSpan={
                    Object.keys(problems).flatMap((key) => problems[key]).length
                  }
                >
                  Descrizione comportamento
                </th>
                <th rowSpan={3}>Intensità</th>
                <th rowSpan={3}>Durata e ripetitività</th>
                <th rowSpan={3}>Causa scatenante e descrizione</th>
                <th rowSpan={3}>Contenimento</th>
                <th className="ttr" rowSpan={3}>
                  f
                </th>
              </tr>
              <tr>
                {Object.keys(problems).map((key, index) => (
                  <th
                    key={key}
                    colSpan={problems[key].length}
                    style={{
                      backgroundColor: headerColors[index],
                      color: "white",
                    }}
                  >
                    {key}
                  </th>
                ))}
              </tr>
              <tr>
                {Object.keys(problems).flatMap((key, classIndex) =>
                  problems[key]
                    .sort((a, b) => a.id - b.id)
                    .map((problem) => (
                      <th
                        style={{
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          backgroundColor: headerColors[classIndex],
                          color: "white",
                        }}
                        key={problem.id}
                        className="problem-name"
                      >
                        {problem.nome}
                      </th>
                    ))
                )}
              </tr>
            </thead>
            <tbody>
              {problemRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      editMode
                        ? 8 +
                          Object.keys(problems).flatMap((key) => problems[key])
                            .length
                        : 7 +
                          Object.keys(problems).flatMap((key) => problems[key])
                            .length
                    }
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Nessun dato
                  </td>
                </tr>
              ) : (
                problemRecords.map((record, index) => (
                  <tr key={record.id}>
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

                              const eventDate = new Date(record.date);

                              const isInRange =
                                eventDate >= monday && eventDate <= friday;

                              if (
                                (user && user.permissions > 20) ||
                                isInRange
                              ) {
                                return (
                                  <>
                                    <button
                                      className="edit-row-btn"
                                      onClick={() => {
                                        setEditingProblemRecord(record);
                                        setEditingIndex(record.id);
                                        setFormIsShown(true);
                                        setEditMode(false); // Exit edit mode after selecting an item
                                      }}
                                      title="Modifica questa registrazione"
                                    >
                                      <FaPencilAlt />
                                    </button>
                                    <button
                                      className="delete-row-btn"
                                      onClick={() =>
                                        deleteProblemRecord(record.id)
                                      }
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
                    <td>{record.date}</td>
                    {Object.keys(problems).flatMap((key) =>
                      problems[key].map((problem) => (
                        <td
                          key={problem.id}
                          className={
                            (record.problem_statuses[problem.id - 1]
                              ? "yes"
                              : "no") +
                            " " +
                            "show-line"
                          }
                        >
                          {record.problem_statuses[problem.id - 1] ? "✓" : ""}
                        </td>
                      ))
                    )}
                    <td>{record.intensity}</td>
                    <td>{record.duration}</td>
                    <td>{record.cause}</td>
                    <td>{record.containment}</td>
                    <td className="signature">{record.signature}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <p className="report-text">
            {problemRecords.map((record, index) => (
              <p className="report-text-entry">
                <p>
                  <b>Data:</b> {record.date}
                </p>
                <p>
                  <b>Comportamenti:</b>
                </p>
                <ul>
                  {Object.keys(problems).flatMap((key) =>
                    problems[key].map((problem) =>
                      record.problem_statuses[problem.id - 1] ? (
                        <li key={problem.id}>{problem.nome}</li>
                      ) : null
                    )
                  )}
                </ul>
                <p>
                  <b>Intensità:</b> {record.intensity}
                </p>
                <p>
                  <b>Durata:</b> {record.duration}
                </p>
                <p>
                  <b>Causa e descrizione:</b> {record.cause}
                </p>
                <p>
                  <b>Contenimento:</b> {record.containment}
                </p>
                <p>
                  <b>Firma:</b> {record.signature}
                </p>
              </p>
            ))}
          </p>
        )}
        {formIsShown && (
          <GenericForm
            title={editingProblemRecord ? "Modifica evento" : "Nuovo evento"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingProblemRecord(null);
              setEditingIndex(-1);
            }}
          >
            <NewProblemBehaviorForm
              problems={problems}
              editData={editingProblemRecord || undefined}
              editingIndex={editingIndex || -1}
            />
          </GenericForm>
        )}
      </div>
    </div>
  );
};

export default ProblemBehavior;

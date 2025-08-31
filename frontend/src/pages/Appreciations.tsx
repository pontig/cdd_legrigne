import React, { Fragment, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePlace } from "../contexts/PlaceContext";
import { useUser } from "../contexts/UserContext";
import { useSemester } from "../contexts/SemesterContext";
import { apiService } from "../services/apiService";
import LeftBar from "../components/LeftBar";
import { FaPrint, FaTable } from "react-icons/fa";
import { ImStatsBars } from "react-icons/im";
import { IoCaretBackOutline } from "react-icons/io5";

import "../styles/appreciations.css";
import MonthSelector from "../components/MonthSelector";

interface Root {
  activities: Activity[];
  appreciations: Appreciation[];
  session_id?: string;
}

interface Activity {
  abbreviazione: string;
  id: number;
  nome_attivita: string;
}

interface Appreciation {
  activities: AppreciationActivity[];
  id_persona: number;
  nome: string;
  cognome: string;
  graph: string | null;
  graph_ready: boolean;
}

interface AppreciationActivity {
  attivita: number;
  id_persona: number;
  media_adesione: number;
  media_partecipazione: number;
  n_volte: number;
}

interface GraphsResponse {
  graphs: { [personId: string]: string };
}

interface NextGraphResponse {
  person_id?: number;
  graph?: string;
  completed?: boolean;
  progress?: {
    current: number;
    total: number;
  };
  error?: string;
}

const Appreciations: React.FC = () => {
  const bimestri = [
    "Gennaio - Febbraio",
    "Marzo - Aprile",
    "Maggio - Giugno",
    "Luglio - Agosto",
    "Settembre - Ottobre",
    "Novembre - Dicembre",
  ];
  const mesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  const { user, setUser } = useUser();
  const {
    semesterString,
    semesterNumber,
    setSemesterString,
    setSemesterNumber,
  } = useSemester();
  const { place, setPlace } = usePlace();
  const navigate = useNavigate();
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [graphIsShown, setGraphIsShown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [graphsLoading, setGraphsLoading] = useState<Set<number>>(new Set());
  const [graphProgress, setGraphProgress] = useState<{ current: number, total: number } | null>(null);
  const [isGeneratingGraphs, setIsGeneratingGraphs] = useState<boolean>(false);

  const fetchAppreciations = useCallback(
    async (month?: number | null): Promise<void> => {
      setIsLoading(true);
      try {
        const response = month
          ? await apiService.fetchAppreciations(month)
          : await apiService.fetchAppreciations();
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
          const data = response.data as Root;
          setActivities(data.activities);
          setAppreciations(data.appreciations);

          // If we have a session_id, start sequential graph generation
          if (data.session_id) {
            setSessionId(data.session_id);
            // Mark all persons as having graphs loading
            const loadingSet = new Set(data.appreciations.map(p => p.id_persona));
            setGraphsLoading(loadingSet);
            setGraphProgress({ current: 0, total: data.appreciations.length });
            startSequentialGraphGeneration(data.session_id);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const startSequentialGraphGeneration = useCallback(
    async (sessionId: string) => {
      setIsGeneratingGraphs(true);

      try {
        while (true) {
          const response = await apiService.fetchNextGraph(sessionId);

          if (response.error) {
            console.error("Error fetching next graph:", response.error);
            break;
          }

          const graphResponse = response.data as NextGraphResponse;

          // Process the graph data if available
          if (graphResponse.person_id && graphResponse.graph) {
            // Update the specific person's graph
            setAppreciations(prev =>
              prev.map(appreciation => {
                if (appreciation.id_persona === graphResponse.person_id) {
                  return {
                    ...appreciation,
                    graph: graphResponse.graph!,
                    graph_ready: true
                  };
                }
                return appreciation;
              })
            );

            // Update loading set and progress
            setGraphsLoading(prev => {
              const newSet = new Set(prev);
              newSet.delete(graphResponse.person_id!);
              return newSet;
            });

            if (graphResponse.progress) {
              setGraphProgress(graphResponse.progress);
            }
          }

          // Check for completion AFTER processing the graph
          if (graphResponse.completed) {
            // All graphs are completed
            setIsGeneratingGraphs(false);
            setGraphsLoading(new Set());
            setGraphProgress(null);
            break;
          }
        }
      } catch (error) {
        console.error("Error in sequential graph generation:", error);
        setIsGeneratingGraphs(false);
      }
    },
    []
  );

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setIsGeneratingGraphs(false);
    };
  }, []);

  const handleMonthChange = (month: number | null) => {
    // Stop any ongoing graph generation
    setIsGeneratingGraphs(false);

    // Reset state
    setGraphsLoading(new Set());
    setGraphProgress(null);
    setSessionId(null);
    setSelectedMonth(month);
    fetchAppreciations(month);
  };  // Filter activities that have at least one entry
  const activitiesWithData = activities.filter((activity) =>
    appreciations.some((appreciation) =>
      appreciation.activities.some((a) => a.attivita === activity.id)
    )
  );

  // Effects
  useEffect(() => {
    fetchAppreciations();
  }, []);

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: graphIsShown ? "Visualizza tabella" : "Visualizza grafico",
            action: () => setGraphIsShown(!graphIsShown),
            icon: graphIsShown ? <FaTable /> : <ImStatsBars />,
          },
          {
            title: "Stampa questa pagina",
            action: () => window.print(),
            icon: <FaPrint />,
            disabled: isGeneratingGraphs || isLoading,
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
          <h1>
            Gradimenti attività{" "}
            {selectedMonth !== null
              ? `per il mese di ${mesi[selectedMonth - 1]}`
              : ""}
          </h1>
          <p className="subtitle">{semesterString}</p>
          {isGeneratingGraphs ? (
            <p>Generazione grafici in corso...</p>
          ) :  (<MonthSelector
            selectedMonth={selectedMonth}
            handleMonthChange={handleMonthChange}
          />)}
        </div>
        {isLoading ? (
          <div className="loading-container">Caricamento in corso...</div>
        ) : (
          <>
            {!graphIsShown ? (
              <table className="wide-table problem-behavior-table">
                <thead>
                  <tr>
                    <th rowSpan={2} className="ttl">
                      Cognome
                    </th>
                    <th rowSpan={2}>Nome</th>
                    {activitiesWithData.map((activity) => (
                      <th
                        title={activity.nome_attivita}
                        key={activity.id}
                        colSpan={3}
                        style={{ position: "sticky", top: 0 }}
                      >
                        {activity.abbreviazione} <br />
                        <span style={{ fontSize: "0.8rem" }}>{activity.nome_attivita}</span>
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {activitiesWithData.map((activity) => (
                      <Fragment key={activity.id}>
                        <th>a</th>
                        <th>p</th>
                        <th>#</th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appreciations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2 + activitiesWithData.length * 3}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Nessuna attività per il periodo selezionato
                      </td>
                    </tr>
                  ) : (
                    appreciations.map((appreciation) => (
                      <tr key={appreciation.id_persona}>
                        <td>{appreciation.cognome}</td>
                        <td
                          style={{
                            position: "sticky",
                            left: 0,
                            backgroundColor: "inherit",
                          }}
                        >
                          {appreciation.nome}
                        </td>
                        {activitiesWithData.map((activity) => {
                          const activityData = appreciation.activities.find(
                            (a) => a.attivita === activity.id
                          );
                          const getBackgroundColor = (
                            value: number | undefined
                          ) => {
                            if (value === undefined) return "";
                            if (value >= 66) return "#90EE90";
                            if (value <= 33) return "#FFB6C1";
                            return "#ffff9bff";
                          };

                          return (
                            <Fragment key={activity.id}>
                              <td
                                style={{
                                  backgroundColor: getBackgroundColor(
                                    activityData?.media_adesione
                                  ),
                                }}
                              >
                                {activityData
                                  ? activityData.media_adesione.toFixed(0)
                                  : "-"}
                              </td>
                              <td
                                style={{
                                  backgroundColor: getBackgroundColor(
                                    activityData?.media_partecipazione
                                  ),
                                }}
                              >
                                {activityData
                                  ? activityData.media_partecipazione.toFixed(0)
                                  : "-"}
                              </td>
                              <td>
                                {activityData ? activityData.n_volte : "-"}
                              </td>
                            </Fragment>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div className="appreciations-graph-container">
                {isGeneratingGraphs && graphProgress && (
                  <div className="graphs-loading-info">
                    <p>
                      Generazione grafici in corso: {graphProgress.current}/{graphProgress.total}
                    </p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(graphProgress.current / graphProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {appreciations.map((appreciation) => (
                  <div key={appreciation.id_persona} className="graph">
                    <h3>
                      {appreciation.cognome} {appreciation.nome}
                    </h3>
                    {appreciation.graph_ready && appreciation.graph ? (
                      <img
                        src={`data:image/png;base64,${appreciation.graph}`}
                        alt={`${appreciation.nome} ${appreciation.cognome} graph`}
                      />
                    ) : (
                      <div className="graph-loading">
                        <p>In attesa di generazione...</p>
                        <div className="loading-spinner"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Appreciations;

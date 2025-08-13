import React, { useEffect, useState } from "react";
import LeftBar from "../components/LeftBar";
import { IoCaretBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSemester } from "../contexts/SemesterContext";
import { TiTickOutline } from "react-icons/ti";
import apiService from "../services/apiService";

interface Semester {
  id: number;
  start: string;
  end: string;
}

const Semesters: React.FC = () => {
  // State
  const { setSemesterString, setSemesterNumber } = useSemester();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // API functions
  const setSemester = async (
    semesterId: number,
    from: string,
    to: string
  ): Promise<void> => {
    const response = await apiService.setSemester(semesterId);

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
      setSemesterNumber(semesterId);
      setSemesterString(`Semestre dal ${from} al ${to}`);
      navigate("/");
    }
  };

  const resetSemester = async (): Promise<void> => {
    const response = await apiService.resetSemester();

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
      setSemesterNumber(null);
      setSemesterString(null);
      navigate("/");
    }
  };

  // Effects
  useEffect(() => {
    const loadSemesters = async (): Promise<void> => {
      const response = await apiService.fetchSemestersList();

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
        setSemesters(response.data as Semester[]);
      }
    };

    loadSemesters();
  }, [navigate]);

  // Return
  return (
    <div className="main-container">
      <LeftBar
        entries={[
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
          <h1>Elenco Semestri</h1>
        </div>
        <table style={{ marginLeft: "auto", marginRight: "auto" }}>
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Seleziona</th>
            </tr>
          </thead>
          <tbody>
            <tr key={-1}>
              <td>Semestre in corso</td>
              <td>
                <button
                  className="edit-row-btn"
                  onClick={() => {
                    resetSemester();
                  }}
                  style={{ textAlign: "center" }}
                >
                  <TiTickOutline />
                </button>
              </td>
            </tr>
            {semesters.map((semester) => (
              <tr key={semester.id}>
                <td>{`${semester.start} - ${semester.end}`}</td>
                <td>
                  <button
                    className="edit-row-btn"
                    onClick={() => {
                      setSemester(semester.id, semester.start, semester.end);
                    }}
                    style={{ textAlign: "center" }}
                  >
                    <TiTickOutline />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Semesters;

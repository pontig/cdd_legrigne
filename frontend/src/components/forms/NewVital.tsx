import React, { useState } from "react";
import apiService from "../../services/apiService";
import { useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

interface NewWeightFormProps {
  editData?: {
    id: number;
    date: string;
    min_pressure: number;
    max_pressure: number;
    heart_rate: number;
    temperature: number;
    saturation: number;
  };
  editingIndex: number;
}

const NewVitalForm: React.FC<NewWeightFormProps> = ({ editData, editingIndex }) => {
  const [maxPressureType, setMaxPressureType] = useState<string>("");
  const [minPressureType, setMinPressureType] = useState<string>("");
  const [temperatureType, setTemperatureType] = useState<string>("");
  const [heartRateType, setHeartRateType] = useState<string>("");
  const [saturationType, setSaturationType] = useState<string>("");

  const handleSelectChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.createVitalEntry({
      ...data,
      person_id: location.state.guestId,
    });

    if (response.error) {
      alert("Log creation failed: " + response.error);
      return;
    }

    if (editData && editingIndex !== -1) {
      const deleteResponse = await apiService.deleteVitalEntry(editingIndex);
      if (deleteResponse.error) {
        alert("Log deletion failed: " + deleteResponse.error);
        return;
      }
    }

    window.location.reload();
  };

  const { user } = useUser();
  const location = useLocation();

  return (
    <form method="POST" onSubmit={handleSubmit} >
      <label>
        Data:
        <input
          type="date"
          name="date"
          required
          defaultValue={
            editData?.date
              ? new Date(editData.date).toISOString().split("T")[0]
              : ""
          }
        />
      </label>
      <label>
        Massima:
        {maxPressureType === "custom" || (editData) ? (
          <input
            type="number"
            name="max_pressure"
            min={100}
            max={179}
            step={0.01}
            defaultValue={editData?.max_pressure ?? ""}
            required
          />
        ) : (
          <select name="max_pressure" value={maxPressureType} onChange={handleSelectChange(setMaxPressureType)} required>
            <option value="">Seleziona...</option>
            <option value="custom">Personalizzata</option>
            {Array.from({ length: 60 }, (_, i) => 159 - i).map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        )}
      </label>
      <label>
        Minima:
        {minPressureType === "custom" || (editData) ? (
          <input
            type="number"
            name="min_pressure"
            min={70}
            max={109}
            step={0.01}
            defaultValue={editData?.min_pressure ?? ""}
            required
          />
        ) : (
          <select name="min_pressure" value={minPressureType} onChange={handleSelectChange(setMinPressureType)} required>
            <option value="">Seleziona...</option>
            <option value="custom">Personalizzata</option>
            {Array.from({ length: 60 }, (_, i) => 109 - i).map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        )}
      </label>
      <label>
        Frequenza cardiaca (bpm):
        {heartRateType === "custom" || (editData) ? (
          <input
            type="number"
            name="heart_rate"
            min={30}
            max={220}
            step={0.01}
            defaultValue={editData?.heart_rate ?? ""}
            required
          />
        ) : (
          <select name="heart_rate" value={heartRateType} onChange={handleSelectChange(setHeartRateType)} required>
            <option value="">Seleziona...</option>
            <option value="custom">Personalizzata</option>
            {Array.from({ length: 181 }, (_, i) => i + 40).map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        )}
      </label>
      <label>
        Temperatura corporea (°C):
        {temperatureType === "custom" || (editData) ? (
          <input
            type="number"
            name="temperature"
            min={35}
            max={39}
            step={0.01}
            defaultValue={editData?.temperature.toString() ?? ""}
            required
          />
        ) : (
          <select name="temperature" value={temperatureType} onChange={handleSelectChange(setTemperatureType)} required>
            <option value="">Seleziona...</option>
            <option value="custom">Personalizzata</option>
            {Array.from({ length: 41 }, (_, i) => (42 - i) / 10 + 35).map(val => (
              <option key={val} value={val.toFixed(1)}>{val.toFixed(1)}</option>
            ))}
          </select>
        )}
      </label>
      <label>
        Saturazione (%):
        {saturationType === "custom" || (editData) ? (
          <input
            type="number"
            name="saturation"
            min={50}
            max={100}
            step={0.01}
            defaultValue={editData?.saturation ?? ""}
            required
          />
        ) : (
          <select name="saturation" value={saturationType} onChange={handleSelectChange(setSaturationType)} required>
            <option value="">Seleziona...</option>
            <option value="custom">Personalizzata</option>
            {Array.from({ length: 51 }, (_, i) => i + 50).map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        )}
      </label>
      <button type="submit">{editData ? "Aggiorna" : "Inserisci"}</button>
    </form>
  )
}

export default NewVitalForm;
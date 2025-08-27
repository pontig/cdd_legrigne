import React from "react";

const MonthSelector: React.FC<{ selectedMonth: number | null; handleMonthChange: (month: number | null) => void; }> = ({ selectedMonth, handleMonthChange }) => {
    return (
        <div className="month-selector">
            <label
                htmlFor="month-select"
                style={{
                    marginRight: "0.5rem",
                    flexDirection: "row",
                    fontSize: "1.5rem",
                }}
            >
                Mese:
                <select
                    className="month-select"
                    value={selectedMonth ?? ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        handleMonthChange(value === "" ? null : parseInt(value));
                    }}
                >
                    <option value="">Tutti i dati del semestre</option>
                    <option value="1">Gennaio</option>
                    <option value="2">Febbraio</option>
                    <option value="3">Marzo</option>
                    <option value="4">Aprile</option>
                    <option value="5">Maggio</option>
                    <option value="6">Giugno</option>
                    <option value="7">Luglio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Settembre</option>
                    <option value="10">Ottobre</option>
                    <option value="11">Novembre</option>
                    <option value="12">Dicembre</option>
                </select>
            </label>
        </div>
    );
};

export default MonthSelector;

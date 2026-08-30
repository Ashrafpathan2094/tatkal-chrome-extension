import React, { useState, useEffect } from "react";
import "./App.css";

type Passenger = {
  name: string;
  age: string;
  gender: string;
  food: string;
};

// IRCTC passenger form constraints. Kept as named constants so they can be
// retuned in one place if IRCTC changes the form.
const MAX_NAME_LENGTH = 16;
// IRCTC accepts alphabets and spaces only in passenger names.
const NAME_PATTERN = "[A-Za-z ]+";
const MIN_AGE = 1;
const MAX_AGE = 125;

function App() {
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "M", food: "D" }, // Default food set to "D"
  ]);
  const [submittedPassengers, setSubmittedPassengers] = useState<Passenger[]>(
    [],
  );
  const [showAll, setShowAll] = useState(false);

  // Load stored data on component mount
  useEffect(() => {
    chrome.storage.local.get("passengerDetails", (result) => {
      if (result.passengerDetails) {
        setPassengers(result.passengerDetails);
        setSubmittedPassengers(result.passengerDetails);
      }
    });
  }, []);

  const handleInputChange = (
    index: number,
    field: keyof Passenger,
    value: string,
  ) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([
        ...passengers,
        { name: "", age: "", gender: "M", food: "D" }, // Default food set to "D"
      ]);
    } else {
      alert("Maximum of 6 passengers allowed.");
    }
  };

  const removePassenger = (index: number) => {
    const updatedPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(updatedPassengers);
  };

  const clearAll = () => {
    setPassengers([{ name: "", age: "", gender: "M", food: "D" }]); // Reset with default food
    setSubmittedPassengers([]);
    chrome.storage.local.remove("passengerDetails");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Collapse stray whitespace - it counts against IRCTC's 16-char budget.
    const normalized = passengers.map((p) => ({
      ...p,
      name: p.name.trim().replace(/\s+/g, " "),
    }));
    setPassengers(normalized);
    setSubmittedPassengers(normalized);
    chrome.storage.local.set({ passengerDetails: normalized });
    alert("Passenger details saved!");
  };

  return (
    <div className="App">
      <header className="ticket-header">
        <span className="ticket-header__eyebrow">IRCTC Auto Fill</span>
        <h2 className="ticket-header__title">Passenger Manifest</h2>
        <span className="ticket-header__count">{passengers.length}/6</span>
      </header>

      <div className="perforation" aria-hidden="true" />

      <form onSubmit={handleSubmit}>
        <div className="stub-list">
          {passengers.map((passenger, index) => (
            <div key={index} className="stub">
              <div
                className="stub__notch stub__notch--left"
                aria-hidden="true"
              />
              <div
                className="stub__notch stub__notch--right"
                aria-hidden="true"
              />

              <div className="stub__row stub__row--head">
                <span className="stub__code">
                  PSGR&middot;{String(index + 1).padStart(2, "0")}
                </span>
                {index > 0 && (
                  <button
                    type="button"
                    className="stub__remove"
                    onClick={() => removePassenger(index)}
                    aria-label={`Remove passenger ${index + 1}`}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="stub__row">
                <input
                  type="text"
                  placeholder="Full name"
                  maxLength={MAX_NAME_LENGTH}
                  pattern={NAME_PATTERN}
                  title={`Letters and spaces only, up to ${MAX_NAME_LENGTH} characters`}
                  value={passenger.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="stub__row stub__row--split">
                <input
                  type="number"
                  placeholder="Age"
                  min={MIN_AGE}
                  max={MAX_AGE}
                  step={1}
                  title={`Age between ${MIN_AGE} and ${MAX_AGE}`}
                  value={passenger.age}
                  onChange={(e) =>
                    handleInputChange(index, "age", e.target.value)
                  }
                  required
                />
                <select
                  value={passenger.gender}
                  onChange={(e) =>
                    handleInputChange(index, "gender", e.target.value)
                  }
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="T">Transgender</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="add-btn"
          onClick={addPassenger}
          disabled={passengers.length >= 6}
        >
          + Add passenger
        </button>

        <div className="perforation" aria-hidden="true" />

        <div className="action-row">
          <button type="submit" className="save-btn">
            Save details
          </button>
          <button type="button" className="clear-btn" onClick={clearAll}>
            Clear all
          </button>
        </div>
      </form>

      {submittedPassengers.length > 0 && (
        <section className="manifest">
          <h3 className="manifest__title">
            Saved manifest <span>({submittedPassengers.length})</span>
          </h3>
          <ul>
            {submittedPassengers
              .slice(0, showAll ? submittedPassengers.length : 2)
              .map((p, index) => (
                <li key={index}>
                  <span className="manifest__num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="manifest__name">{p.name}</span>
                  <span className="manifest__age">{p.age}</span>
                  <span className="manifest__gender">{p.gender}</span>
                  <span className="manifest__food">
                    {p.food === "D" ? "No food" : p.food}
                  </span>
                </li>
              ))}
          </ul>
          {submittedPassengers.length > 2 && (
            <button onClick={() => setShowAll(!showAll)} className="toggle-btn">
              {showAll ? "Show less \u25B4" : "Show all \u25BE"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

export default App;

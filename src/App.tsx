import React, { useState, useEffect } from "react";
import "./App.css";

type Passenger = {
  name: string;
  age: string;
  gender: string;
  food: string;
};

function App() {
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", age: "", gender: "M", food: "D" }, // Default food set to "D"
  ]);
  const [submittedPassengers, setSubmittedPassengers] = useState<Passenger[]>(
    []
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
    value: string
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
    setSubmittedPassengers(passengers);
    chrome.storage.local.set({ passengerDetails: passengers });
    alert("Passenger details saved!");
  };

  return (
    <div className="App">
      <h2>Passenger Details Form</h2>
      <form onSubmit={handleSubmit}>
        {passengers.map((passenger, index) => (
          <div key={index} className="passenger-form">
            <input
              type="text"
              placeholder="Name"
              value={passenger.name}
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={passenger.age}
              onChange={(e) => handleInputChange(index, "age", e.target.value)}
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
            </select>
            {index > 0 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removePassenger(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="add-btn"
          onClick={addPassenger}
          disabled={passengers.length >= 6}
        >
          Add Passenger
        </button>
        <button type="submit" className="save-btn">
          Submit Details
        </button>
        <button type="button" className="clear-btn" onClick={clearAll}>
          Clear All
        </button>
      </form>

      <h3>Submitted Passenger Details</h3>
      <ul>
        {submittedPassengers
          .slice(0, showAll ? submittedPassengers.length : 2)
          .map((p, index) => (
            <li key={index}>
              {p.name} - {p.age} - {p.gender} -{" "}
              {p.food === "D" ? "No Food" : p.food}
            </li>
          ))}
      </ul>
      {submittedPassengers.length > 2 && (
        <button onClick={() => setShowAll(!showAll)} className="toggle-btn">
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

export default App;

import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const onclick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        // Click the anchor tag
        const addPassengerButton = document.querySelector("a .prenext");
        if (addPassengerButton) {
          (addPassengerButton as HTMLElement).click();
        } else {
          console.log("Add Passenger button not found");
        }

        // Find input fields and set values
        const inputFields = document.querySelectorAll(
          "input.ui-autocomplete-input"
        );

        if (inputFields.length > 0) {
          (inputFields[0] as HTMLInputElement).value = "Ashraf Khan";
          inputFields[0].dispatchEvent(new Event("input", { bubbles: true }));

          if (inputFields.length > 1) {
            (inputFields[1] as HTMLInputElement).value = "Shahid Shah";
            inputFields[1].dispatchEvent(new Event("input", { bubbles: true }));
          }
        } else {
          console.log("No input fields found");
        }

        // set age
        const ageInputs = document.querySelectorAll(
          "input[formcontrolname='passengerAge']"
        );

        if (ageInputs.length > 0) {
          (ageInputs[0] as HTMLInputElement).value = "27";
          ageInputs[0].dispatchEvent(new Event("input", { bubbles: true }));

          if (ageInputs.length > 1) {
            (ageInputs[1] as HTMLInputElement).value = "26";
            ageInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
          }
        }

        // set gender
        // Select "Male" in both gender dropdowns
        const genderSelects = document.querySelectorAll(
          "select[formcontrolname='passengerGender']"
        ) as NodeListOf<HTMLSelectElement>;

        if (genderSelects.length >= 2) {
          genderSelects[0].value = "M"; // Set first select to Male
          genderSelects[0].dispatchEvent(
            new Event("change", { bubbles: true })
          );

          genderSelects[1].value = "M"; // Set second select to Male
          genderSelects[1].dispatchEvent(
            new Event("change", { bubbles: true })
          );

          console.log("Selected 'Male' in both gender dropdowns");
        }

        // Select all "passengerFoodChoice" dropdowns
        const foodChoiceSelects = document.querySelectorAll(
          "select[formcontrolname='passengerFoodChoice']"
        ) as NodeListOf<HTMLSelectElement>;

        foodChoiceSelects.forEach((select) => {
          // Set the value of each dropdown to "No Food" (value="D")
          select.value = "D";
          select.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("Selected 'No Food' in the dropdown");
        });

        // Check the "Book Only If Confirmed" checkbox
        const confirmCheckbox = document.querySelector(
          "input[formcontrolname='bookOnlyIfCnf']"
        ) as HTMLInputElement;

        if (confirmCheckbox) {
          confirmCheckbox.checked = true;
          confirmCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("Checked 'Book Only If Confirmed' checkbox");
        }

        // Select the radio button input (using value or name attribute)
        const radioButton = document.querySelector(
          "input[name='paymentType'][value='2']"
        ) as HTMLInputElement;

        if (radioButton) {
          // Simulate a click on the radio button
          radioButton.click();
          console.log("Clicked the radio button with value '2'");
        }
      },
    });
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={onclick}>click me</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

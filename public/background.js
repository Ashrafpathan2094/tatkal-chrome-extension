chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("https://www.irctc.co.in/nget/booking/psgninput")
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        chrome.storage.local.get("passengerDetails", (result) => {
          const passengerDetails = result.passengerDetails;
          console.log("Passenger Details from Storage:", passengerDetails);

          if (!passengerDetails || passengerDetails.length === 0) {
            console.log("No passenger details found in storage");
            return;
          }

          // Click the "Add Passenger" button based on the number of passengers
          for (let i = 1; i < passengerDetails.length; i++) {
            const addPassengerButton = document.querySelector("a .prenext");
            if (addPassengerButton) {
              addPassengerButton.click();
              console.log(
                `Clicked 'Add Passenger' button for passenger ${i + 1}`
              );
            } else {
              console.log("Add Passenger button not found");
            }
          }

          // Delay to ensure all fields are visible
          setTimeout(() => {
            passengerDetails.forEach((passenger, index) => {
              console.log(
                `Filling details for passenger ${index + 1}:`,
                passenger
              );

              // Find name fields and set values
              const nameFields = document.querySelectorAll(
                "input.ui-autocomplete-input"
              );
              if (nameFields[index]) {
                nameFields[index].value = passenger.name;
                nameFields[index].dispatchEvent(
                  new Event("input", { bubbles: true })
                );
              } else {
                console.log(
                  `Name input field not found for passenger ${index + 1}`
                );
              }

              // Set age
              const ageInputs = document.querySelectorAll(
                "input[formcontrolname='passengerAge']"
              );
              if (ageInputs[index]) {
                ageInputs[index].value = passenger.age;
                ageInputs[index].dispatchEvent(
                  new Event("input", { bubbles: true })
                );
              } else {
                console.log(
                  `Age input field not found for passenger ${index + 1}`
                );
              }

              // Set gender
              const genderSelects = document.querySelectorAll(
                "select[formcontrolname='passengerGender']"
              );
              if (genderSelects[index]) {
                genderSelects[index].value = passenger.gender; // e.g., "M" or "F"
                genderSelects[index].dispatchEvent(
                  new Event("change", { bubbles: true })
                );
              } else {
                console.log(
                  `Gender select not found for passenger ${index + 1}`
                );
              }

              // Set food choice
              // Select all "passengerFoodChoice" dropdowns
              const foodChoiceSelects = document.querySelectorAll(
                "select[formcontrolname='passengerFoodChoice']"
              );

              foodChoiceSelects.forEach((select) => {
                // Set the value of each dropdown to "No Food" (value="D")
                select.value = "D";
                select.dispatchEvent(new Event("change", { bubbles: true }));
                console.log("Selected 'No Food' in the dropdown");
              });
            });
            // Check the "Book Only If Confirmed" checkbox
            const confirmCheckbox = document.querySelector(
              "input[formcontrolname='bookOnlyIfCnf']"
            );

            if (confirmCheckbox) {
              confirmCheckbox.checked = true;
              confirmCheckbox.dispatchEvent(
                new Event("change", { bubbles: true })
              );
              console.log("Checked 'Book Only If Confirmed' checkbox");
            }

            // Select the radio button input (using value or name attribute)
            const radioButton = document.querySelector(
              "input[name='paymentType'][value='2']"
            );

            if (radioButton) {
              // Simulate a click on the radio button
              radioButton.click();
              console.log("Clicked the radio button with value '2'");
            }
          }, 1000); // Adjust the delay as needed
        });
      },
    });
  }
});

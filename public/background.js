chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.includes("https://www.irctc.co.in/nget/booking/psgninput")
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Click the anchor tag
        const addPassengerButton = document.querySelector("a .prenext");
        if (addPassengerButton) {
          addPassengerButton.click();
        } else {
          console.log("Add Passenger button not found");
        }

        // Find input fields and set values
        const inputFields = document.querySelectorAll(
          "input.ui-autocomplete-input"
        );

        if (inputFields.length > 0) {
          inputFields[0].value = "Ashraf Khan";
          inputFields[0].dispatchEvent(new Event("input", { bubbles: true }));

          if (inputFields.length > 1) {
            inputFields[1].value = "Shahid Shah";
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
          ageInputs[0].value = "27";
          ageInputs[0].dispatchEvent(new Event("input", { bubbles: true }));

          if (ageInputs.length > 1) {
            ageInputs[1].value = "27";
            ageInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
          }
        }

        // set gender
        // Select "Male" in both gender dropdowns
        const genderSelects = document.querySelectorAll(
          "select[formcontrolname='passengerGender']"
        );

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
        );

        foodChoiceSelects.forEach((select) => {
          // Set the value of each dropdown to "No Food" (value="D")
          select.value = "D";
          select.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("Selected 'No Food' in the dropdown");
        });

        // Check the "Book Only If Confirmed" checkbox
        const confirmCheckbox = document.querySelector(
          "input[formcontrolname='bookOnlyIfCnf']"
        );

        if (confirmCheckbox) {
          confirmCheckbox.checked = true;
          confirmCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
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
      },
    });
  }
});

console.log("[SW] background.js loaded, listener registering...");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("https://www.irctc.co.in/nget/booking/psgninput")
  ) {
    console.log(
      "[SW] Passenger input page matched, injecting fill script",
      tabId,
    );

    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: () => {
          chrome.storage.local.get("passengerDetails", (result) => {
            const passengerDetails = result.passengerDetails;
            console.log(
              "[PAGE] Passenger Details from Storage:",
              passengerDetails,
            );

            if (!passengerDetails || passengerDetails.length === 0) {
              console.log("[PAGE] No passenger details found in storage");
              return;
            }

            // Click the "Add Passenger" button based on the number of passengers
            for (let i = 1; i < passengerDetails.length; i++) {
              const addPassengerButton = document.querySelector("a .prenext");
              if (addPassengerButton) {
                addPassengerButton.click();
                console.log(
                  `[PAGE] Clicked 'Add Passenger' button for passenger ${i + 1}`,
                );
              } else {
                console.log("[PAGE] Add Passenger button not found");
              }
            }

            // Delay to ensure all fields are visible
            setTimeout(() => {
              passengerDetails.forEach((passenger, index) => {
                console.log(
                  `[PAGE] Filling details for passenger ${index + 1}:`,
                  passenger,
                );

                // Find name fields and set values
                const nameFields = document.querySelectorAll(
                  "input.ui-autocomplete-input",
                );
                if (nameFields[index]) {
                  nameFields[index].value = passenger.name;
                  nameFields[index].dispatchEvent(
                    new Event("input", { bubbles: true }),
                  );
                } else {
                  console.log(
                    `[PAGE] Name input field not found for passenger ${index + 1}`,
                  );
                }

                // Set age
                const ageInputs = document.querySelectorAll(
                  "input[formcontrolname='passengerAge']",
                );
                if (ageInputs[index]) {
                  ageInputs[index].value = passenger.age;
                  ageInputs[index].dispatchEvent(
                    new Event("input", { bubbles: true }),
                  );
                } else {
                  console.log(
                    `[PAGE] Age input field not found for passenger ${index + 1}`,
                  );
                }

                // Set gender
                const genderSelects = document.querySelectorAll(
                  "select[formcontrolname='passengerGender']",
                );
                if (genderSelects[index]) {
                  genderSelects[index].value = passenger.gender; // e.g., "M" or "F"
                  genderSelects[index].dispatchEvent(
                    new Event("change", { bubbles: true }),
                  );
                } else {
                  console.log(
                    `[PAGE] Gender select not found for passenger ${index + 1}`,
                  );
                }

                // Set food choice
                // Select all "passengerFoodChoice" dropdowns
                const foodChoiceSelects = document.querySelectorAll(
                  "select[formcontrolname='passengerFoodChoice']",
                );

                foodChoiceSelects.forEach((select) => {
                  // Set the value of each dropdown to "No Food" (value="D")
                  select.value = "D";
                  select.dispatchEvent(new Event("change", { bubbles: true }));
                  console.log("[PAGE] Selected 'No Food' in the dropdown");
                });
              });
              // Check the "Book Only If Confirmed" checkbox
              const confirmCheckbox = document.querySelector(
                "input[formcontrolname='bookOnlyIfCnf']",
              );

              if (confirmCheckbox) {
                confirmCheckbox.checked = true;
                confirmCheckbox.dispatchEvent(
                  new Event("change", { bubbles: true }),
                );
                console.log("[PAGE] Checked 'Book Only If Confirmed' checkbox");
              }

              // Select the radio button input (using value or name attribute)
              const radioButton = document.querySelector(
                "input[name='paymentType'][value='2']",
              );

              if (radioButton) {
                // Simulate a click on the radio button
                radioButton.click();
                console.log("[PAGE] Clicked the radio button with value '2'");
              }

              const continueBtn = document.querySelector(
                "button.train_Search.btnDefault",
              );
              if (continueBtn) {
                continueBtn.click();
                console.log("[PAGE] Clicked Continue button");
              } else {
                console.log("[PAGE] Continue button not found");
              }
            }, 1000); // Adjust the delay as needed
          });
        },
      })
      .catch((err) => console.log("[SW] executeScript failed:", err));
  } else if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("https://www.irctc.co.in/nget/payment/bkgPaymentOptions")
  ) {
    console.log(
      "[SW] Payment options page matched, injecting payment script",
      tabId,
    );

    // This whole block runs in the PAGE context via executeScript.
    // document does not exist inside the background service worker.
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: () => {
          function waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
              const interval = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                  clearInterval(interval);
                  resolve(el);
                }
              }, 100);
              setTimeout(() => {
                clearInterval(interval);
                reject(new Error("Element not found: " + selector));
              }, timeout);
            });
          }

          // Step 1: click the UPI category tile
          const upiOption = Array.from(
            document.querySelectorAll("div.bank-type"),
          ).find((el) => el.textContent.trim().includes("BHIM/ UPI/ USSD"));

          if (!upiOption) {
            console.log("[PAGE] UPI option not found");
            return;
          }
          upiOption.click();
          console.log("[PAGE] Clicked UPI category tile");

          // Step 2: wait for the PAYTM sub-option to render (Angular needs a
          // tick after the click above before this exists in the DOM)
          waitForElement("div.bank-text")
            .then(() => {
              const paytmOption = Array.from(
                document.querySelectorAll("div.bank-text"),
              ).find((el) => el.textContent.trim().includes("PAYTM UPI"));

              if (!paytmOption) {
                console.log("[PAGE] PAYTM UPI option not found");
                return;
              }
              paytmOption.click();
              console.log("[PAGE] Clicked PAYTM UPI option");

              // Step 3: wait for Pay & Book button to be ready, but don't
              // auto-click it - this is the final money-committing action.
              return waitForElement("button.btn.btn-primary.hidden-xs");
            })
            .then((payBtn) => {
              if (!payBtn) return;
              payBtn.click();
            })
            .catch((err) => console.log("[PAGE]", err.message));
        },
      })
      .catch((err) => console.log("[SW] executeScript failed:", err));
  }
});

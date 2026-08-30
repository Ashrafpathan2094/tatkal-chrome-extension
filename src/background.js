console.log("[SW] background.js loaded, listener registering...");

// Pages whose automation is just "find an element by its visible text, click it,
// wait for the next one to render". Steps run in order, each one waiting for its
// element to appear before clicking.
const CLICK_SEQUENCES = [
  {
    url: "https://www.irctc.co.in/nget/booking/reviewBooking",
    label: "Review booking page",
    steps: [{ selector: "button.btnDefault.train_Search", text: "Continue" }],
  },
  {
    url: "https://www.irctc.co.in/nget/payment/bkgPaymentOptions",
    label: "Payment options page",
    steps: [
      { selector: "div.bank-type", text: "Multiple Payment Service" },
      // The clickable node is the tabindex wrapper around the bank-text div.
      { selector: "div.bank-text", text: "PhonePe", clickClosest: "[tabindex]" },
      { selector: "button.btn-primary", text: "Pay & Book" },
    ],
  },
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // IRCTC is an Angular SPA: some transitions are full loads ("complete"),
  // others are client-side route changes that only report a url change.
  if (changeInfo.status !== "complete" && !changeInfo.url) return;

  const url = changeInfo.url || tab.url;
  if (!url) return;

  if (url.includes("https://www.irctc.co.in/nget/booking/psgninput")) {
    inject(tabId, "Passenger input page", fillPassengerDetails);
    return;
  }

  const sequence = CLICK_SEQUENCES.find((s) => url.includes(s.url));
  if (sequence) {
    inject(tabId, sequence.label, runClickSequence, [sequence.steps]);
  }
});

function inject(tabId, label, func, args = []) {
  console.log("[SW] " + label + " matched, injecting script", tabId);
  chrome.scripting
    .executeScript({ target: { tabId }, func, args })
    .catch((err) => console.log("[SW] executeScript failed:", err));
}

// ---------------------------------------------------------------------------
// Everything below runs in the PAGE context via executeScript, so each function
// must be self-contained - it cannot reference anything from this module.
// ---------------------------------------------------------------------------

function runClickSequence(steps) {
  // Mark the route as handled so a repeated onUpdated event can't replay the
  // sequence - the last step commits money.
  const ran = (window.__irctcAutoFill = window.__irctcAutoFill || {});
  if (ran[location.pathname]) {
    console.log("[PAGE] Already handled", location.pathname, "- skipping");
    return;
  }
  ran[location.pathname] = true;

  const label = (el) => el.textContent.replace(/\s+/g, " ").trim();

  // Prefer an exact text match so "PhonePe" can't pick up "PhonePe Wallet".
  function find(step) {
    const nodes = Array.from(document.querySelectorAll(step.selector));
    const match =
      nodes.find((el) => label(el) === step.text) ||
      nodes.find((el) => label(el).includes(step.text));
    if (!match) return null;
    return step.clickClosest ? match.closest(step.clickClosest) || match : match;
  }

  function waitFor(step, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        const el = find(step);
        if (el) {
          resolve(el);
          return;
        }
        if (Date.now() - started >= timeout) {
          reject(new Error('"' + step.text + '" (' + step.selector + ") not found"));
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    });
  }

  steps
    .reduce(
      (chain, step) =>
        chain.then(() =>
          waitFor(step).then((el) => {
            el.click();
            console.log('[PAGE] Clicked "' + step.text + '"');
          }),
        ),
      Promise.resolve(),
    )
    .catch((err) => {
      // Nothing was committed, so allow a later load to retry this route.
      ran[location.pathname] = false;
      console.log("[PAGE]", err.message);
    });
}

function fillPassengerDetails() {
  const ran = (window.__irctcAutoFill = window.__irctcAutoFill || {});
  if (ran[location.pathname]) {
    console.log("[PAGE] Already handled", location.pathname, "- skipping");
    return;
  }
  ran[location.pathname] = true;

  chrome.storage.local.get("passengerDetails", (result) => {
    const passengerDetails = result.passengerDetails;
    console.log("[PAGE] Passenger Details from Storage:", passengerDetails);

    if (!passengerDetails || passengerDetails.length === 0) {
      console.log("[PAGE] No passenger details found in storage");
      ran[location.pathname] = false;
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
          nameFields[index].dispatchEvent(new Event("input", { bubbles: true }));
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
          ageInputs[index].dispatchEvent(new Event("input", { bubbles: true }));
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
        confirmCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
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
}

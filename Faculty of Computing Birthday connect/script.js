


    //  SUPABASE
const SUPABASE_URL = "https://dpkymlzrpcunccguymtc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_szt1aKRsgtKHCxdhPzOY5w_jTjuhlbL";


const isSupabaseConfigured =
  Boolean(window.supabase) &&
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.startsWith("https://") &&
  typeof SUPABASE_PUBLISHABLE_KEY === "string" &&
  SUPABASE_PUBLISHABLE_KEY !== "**" &&
  SUPABASE_PUBLISHABLE_KEY.length > 10;

const supabaseClient = isSupabaseConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;



const form = document.getElementById("registration-form");
const submitBtn = document.getElementById("submit-btn");
const btnLabel = submitBtn.querySelector(".btn__label");
const messageBox = document.getElementById("form-message");

const fields = {
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  department: document.getElementById("department"),
  phone: document.getElementById("phone"),
  gender: document.getElementById("gender"),
  birthdayMonth: document.getElementById("birthdayMonth"),
  birthdayDay: document.getElementById("birthdayDay"),
  birthday: document.getElementById("birthday"),
};

const fieldNames = [
  "firstName",
  "lastName",
  "department",
  "phone",
  "gender",
  "birthday",
];

const NIGERIAN_PHONE_PATTERN = /^(?:\+234|0)[789][01]\d{8}$/;


function showError(input, message) {
  const errorEl = document.getElementById(`${input.id}-error`);
  if (errorEl) {
    errorEl.textContent = message;
  }
  input.setAttribute("aria-invalid", "true");
}


function clearError(input) {
  const errorEl = document.getElementById(`${input.id}-error`);
  if (errorEl) {
    errorEl.textContent = "";
  }
  input.removeAttribute("aria-invalid");
}

function setBirthdayInvalid(isInvalid) {
  if (isInvalid) {
    fields.birthdayMonth.setAttribute("aria-invalid", "true");
    fields.birthdayDay.setAttribute("aria-invalid", "true");
  } else {
    fields.birthdayMonth.removeAttribute("aria-invalid");
    fields.birthdayDay.removeAttribute("aria-invalid");
  }
}

// Show the banner at the top of the form ("success" or "error").
function showMessage(type, text) {
  messageBox.textContent = text;
  messageBox.className = `form-message form-message--${type}`;
  messageBox.hidden = false;
  messageBox.focus();
}

function hideMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
}

function getDaysInMonth(month) {
  // Year 2000 is a leap year, so February 29 remains selectable.
  return new Date(2000, Number(month), 0).getDate();
}

function getBirthdayValue() {
  const month = fields.birthdayMonth.value;
  const day = fields.birthdayDay.value;

  if (!month || !day) return "";

  return `${month}-${day}`;
}

function updateBirthdayValue() {
  fields.birthday.value = getBirthdayValue();
}

function populateBirthdayDays() {
  const month = fields.birthdayMonth.value;
  const currentDay = fields.birthdayDay.value;

  fields.birthdayDay.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = month ? "Select day" : "Select month first";
  placeholder.selected = true;
  placeholder.disabled = true;
  fields.birthdayDay.appendChild(placeholder);

  if (!month) {
    fields.birthdayDay.disabled = true;
    updateBirthdayValue();
    return;
  }

  const numberOfDays = getDaysInMonth(month);

  for (let day = 1; day <= numberOfDays; day += 1) {
    const paddedDay = String(day).padStart(2, "0");
    const option = document.createElement("option");

    option.value = paddedDay;
    option.textContent = day;
    fields.birthdayDay.appendChild(option);
  }

  fields.birthdayDay.disabled = false;

  if (currentDay && Number(currentDay) <= numberOfDays) {
    fields.birthdayDay.value = currentDay;
  }

  updateBirthdayValue();
}

// ==========================================
// 4. VALIDATION RULES
// ==========================================

function validateName(value, label) {
  const name = value.trim();

  if (name === "") return `Please enter your ${label}.`;
  if (name.length < 2) return `Your ${label} must have at least 2 letters.`;

  // Letters, including accents, spaces, hyphens, and apostrophes only.
  if (!/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
    return `Your ${label} can only contain letters, spaces, hyphens and apostrophes.`;
  }

  return "";
}

function validateSelect(value, label) {
  return value === "" ? `Please select your ${label}.` : "";
}

function validatePhone(value) {
  
  const cleaned = value.replace(/[\s-]/g, "");

  if (cleaned === "") return "Please enter your phone number.";
  if (!NIGERIAN_PHONE_PATTERN.test(cleaned)) {
    return "Enter a valid Nigerian number, like 08012345678 or +2348012345678.";
  }

  return "";
}

function validateBirthday() {
  const month = fields.birthdayMonth.value;
  const day = fields.birthdayDay.value;

  if (!month || !day) {
    return "Please select your birth month and day.";
  }

  if (Number(day) > getDaysInMonth(month)) {
    return "Please select a valid birthday.";
  }

  return "";
}

function getErrorFor(fieldName) {
  switch (fieldName) {
    case "firstName":
      return validateName(fields.firstName.value, "first name");
    case "lastName":
      return validateName(fields.lastName.value, "last name");
    case "department":
      return validateSelect(fields.department.value, "department");
    case "phone":
      return validatePhone(fields.phone.value);
    case "gender":
      return validateSelect(fields.gender.value, "gender");
    case "birthday":
      return validateBirthday();
    default:
      return "";
  }
}

function validateField(fieldName) {
  const error = getErrorFor(fieldName);

  if (fieldName === "birthday") {
    const errorEl = document.getElementById("birthday-error");

    if (error) {
      errorEl.textContent = error;
      setBirthdayInvalid(true);
      return false;
    }

    errorEl.textContent = "";
    setBirthdayInvalid(false);
    return true;
  }

  const input = fields[fieldName];

  if (error) {
    showError(input, error);
    return false;
  }

  clearError(input);
  return true;
}

function validateForm() {
  let firstInvalid = null;

  for (const fieldName of fieldNames) {
    const isValid = validateField(fieldName);

    if (!isValid && firstInvalid === null) {
      firstInvalid = fieldName === "birthday"
        ? fields.birthdayMonth
        : fields[fieldName];
    }
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return false;
  }

  return true;
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
  submitBtn.setAttribute("aria-busy", String(isLoading));
  btnLabel.textContent = isLoading
    ? "Submitting your details..."
    : "Register My Birthday";
}

function resetFormState() {
  form.reset();
  fields.birthday.value = "";
  fields.birthdayDay.disabled = true;
  populateBirthdayDays();

  for (const fieldName of fieldNames) {
    if (fieldName === "birthday") {
      const errorEl = document.getElementById("birthday-error");
      if (errorEl) errorEl.textContent = "";
      setBirthdayInvalid(false);
    } else {
      clearError(fields[fieldName]);
    }
  }
}

// ==========================================
// 6. FORM SUBMISSION (SUPABASE OR LOCAL DEMO)
// ==========================================

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (submitBtn.disabled) return;

  hideMessage();

  if (!validateForm()) {
    showMessage("error", "Please fix the highlighted fields and try again.");
    return;
  }

  setLoading(true);

  const birthdayValue = getBirthdayValue(); // "MM-DD", for example "03-14"

  // Supabase's 'birthday' column is of type DATE (YYYY-MM-DD).
  // We use leap year 2000 as the anchor year so all dates (including Feb 29) are valid.
  const formattedBirthday = `2000-${birthdayValue}`;

  const registration = {
    first_name: fields.firstName.value.trim(),
    last_name: fields.lastName.value.trim(),
    department: fields.department.value,
    phone: fields.phone.value.replace(/[\s-]/g, ""),
    gender: fields.gender.value,
    birthday: formattedBirthday,
  };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabaseClient
        .from("registrations")
        .insert([registration]);

      if (error) {
        console.error("Supabase registration error:", error);
        showMessage(
          "error",
          error.message || "Registration failed. Please try again. If the problem continues, contact the website administrator."
        );
        return;
      }

      showMessage(
        "success",
        `Thank you, ${registration.first_name}! Your birthday registration was successful.`
      );
      resetFormState();
    } catch (error) {
      console.error("Connection error:", error);
      showMessage(
        "error",
        "Unable to connect to the database. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  } else {
    // Demo fallback when Supabase credentials are not configured yet
    setTimeout(function () {
      console.log("Validated registration (demo mode):", registration);

      showMessage(
        "success",
        `Thank you, ${registration.first_name}! Your details passed all checks. ` +
          "Supabase credentials are not set yet, so this was simulated locally."
      );

      resetFormState();
      setLoading(false);
    }, 900);
  }
});

// ==========================================
// 7. FIELD EVENT LISTENERS
// ==========================================

fields.birthdayMonth.addEventListener("change", function () {
  populateBirthdayDays();

  if (
    fields.birthdayMonth.getAttribute("aria-invalid") === "true" ||
    fields.birthdayDay.getAttribute("aria-invalid") === "true"
  ) {
    validateField("birthday");
  }
});

fields.birthdayDay.addEventListener("change", function () {
  updateBirthdayValue();

  if (
    fields.birthdayMonth.getAttribute("aria-invalid") === "true" ||
    fields.birthdayDay.getAttribute("aria-invalid") === "true"
  ) {
    validateField("birthday");
  }
});

for (const fieldName of fieldNames) {
  if (fieldName === "birthday") continue;

  const input = fields[fieldName];
  const fixEvent = input.tagName === "SELECT" ? "change" : "input";

  input.addEventListener("blur", function () {
    validateField(fieldName);
  });

  input.addEventListener(fixEvent, function () {
    if (input.getAttribute("aria-invalid") === "true") {
      validateField(fieldName);
    }
  });
}

// Initial setup for birthday select options
populateBirthdayDays();
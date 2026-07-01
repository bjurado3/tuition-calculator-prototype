const body = document.body;
const viewChips = document.querySelectorAll("[data-view-target]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const viewTriggers = document.querySelectorAll("[data-go-view]");
const faqButtons = document.querySelectorAll(".faq-button");
const faqOpenLinks = document.querySelectorAll("[data-open-faq]");
const modalBackdrop = document.querySelector(".modal-backdrop");
const creditModal = document.querySelector(".credit-modal");
const feesModal = document.querySelector(".fees-modal");
const exceptionsModal = document.querySelector(".exceptions-modal");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const feesModalTriggers = document.querySelectorAll("[data-open-fees-modal]");
const creditCountNode = document.getElementById("credit-count");
const creditDisplay = document.querySelector(".credit-display");
const creditLimitError = document.getElementById("credit-limit-error");
const creditChangeButtons = document.querySelectorAll("[data-credit-change]");
const saveCreditLoadButton = document.getElementById("save-credit-load");
const inlineSelects = document.querySelectorAll(".inline-select");
const searchInputs = document.querySelectorAll("[data-select-search]");
const detailInputs = document.querySelectorAll(".detail-input");
const stepOneNextButtons = document.querySelectorAll('[data-go-view="step-two"]');
const editResultsButtons = document.querySelectorAll("[data-edit-results]");
const recalculateResultsButtons = document.querySelectorAll("[data-recalculate-results]");
const editStudentTypeSelect = document.getElementById("edit-credits-per-semester");
const editResidentSelect = document.getElementById("edit-resident");
const editTransferInput = document.getElementById("edit-transfer");
const editGrantsInput = document.getElementById("edit-grants");
const editScholarshipsInput = document.getElementById("edit-scholarships");
const editEmployerBenefitInput = document.getElementById("edit-employer-benefit");
const summaryTransfer = document.querySelector("[data-summary-transfer]");
const summaryCredits = document.querySelector("[data-summary-credits]");
const summaryAid = document.querySelector("[data-summary-aid]");
const summaryBenefit = document.querySelector("[data-summary-benefit]");
const editResidencyGroup = document.querySelector("[data-edit-residency-group]");
const residencySummary = document.querySelector("[data-residency-summary]");
const residencyAnswer = document.querySelector("[data-residency-answer]");
const termHeaders = document.querySelectorAll(".term-header");
const tooltipTriggers = document.querySelectorAll(".tooltip-trigger");
const MAX_TRANSFER_CREDITS = 64;
const MAX_CREDIT_STEPPER_VALUE = MAX_TRANSFER_CREDITS + 1;

const defaultSelectValues = {
  "degree-type": "select a degree type",
  program: "select a program",
  "enrollment-status": "select enrollment status",
};

const estimatorState = {
  "degree-type": defaultSelectValues["degree-type"],
  program: defaultSelectValues.program,
  "enrollment-status": defaultSelectValues["enrollment-status"],
  "resident-choice": "no",
  credits: 0,
  transferCredits: 0,
  grants: 0,
  scholarships: 0,
  employerBenefit: 0,
};

function setView(view) {
  body.dataset.view = view;
  body.dataset.resultsMode = "summary";
  syncResultsFromState();

  viewChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.viewTarget === view);
  });

  viewPanels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.viewPanel === view);
  });
}

function isFullTimeStudent() {
  return estimatorState["enrollment-status"] === "full-time student";
}

function formatCurrency(value) {
  return Math.max(0, Number(value) || 0).toLocaleString("en-US");
}

function getCreditsPerSemesterLabel() {
  if (estimatorState["enrollment-status"] === "custom") {
    return estimatorState.credits > 0 ? `${estimatorState.credits} credits` : "0 credits";
  }

  if (estimatorState["enrollment-status"] === "part-time student") {
    return "6 credits";
  }

  return "12 credits";
}

function syncEditResidencyVisibility() {
  const shouldShowResidency = editStudentTypeSelect?.value === "full-time student";

  if (editResidencyGroup) {
    editResidencyGroup.hidden = !shouldShowResidency;
  }
}

const summaryLabel = document.querySelector("[data-summary-label]");

function syncSummaryFromState() {
  if (summaryLabel) {
    summaryLabel.textContent = "Your estimated academic year total:";
  }

  if (summaryTransfer) {
    summaryTransfer.textContent = `${estimatorState.transferCredits} credits`;
  }

  if (summaryCredits) {
    summaryCredits.textContent = getCreditsPerSemesterLabel();
  }

  if (summaryAid) {
    const aidTotal = estimatorState.grants + estimatorState.scholarships;
    summaryAid.textContent = `$${formatCurrency(aidTotal)}/year`;
  }

  if (summaryBenefit) {
    summaryBenefit.textContent = `$${formatCurrency(estimatorState.employerBenefit)}/year`;
  }

  if (editTransferInput) {
    editTransferInput.value = String(estimatorState.transferCredits);
  }

  if (editGrantsInput) {
    editGrantsInput.value = String(estimatorState.grants);
  }

  if (editScholarshipsInput) {
    editScholarshipsInput.value = String(estimatorState.scholarships);
  }

  if (editEmployerBenefitInput) {
    editEmployerBenefitInput.value = String(estimatorState.employerBenefit);
  }
}

function syncResultsFromState() {
  const shouldShowResidency = isFullTimeStudent();

  if (residencySummary) {
    residencySummary.hidden = !shouldShowResidency;
  }

  if (residencyAnswer) {
    residencyAnswer.textContent = estimatorState["resident-choice"] === "yes" ? "Arizona resident" : "Non-resident";
  }

  if (editStudentTypeSelect) {
    editStudentTypeSelect.value = estimatorState["enrollment-status"];
  }

  if (editResidentSelect) {
    editResidentSelect.value = estimatorState["resident-choice"];
  }

  syncSummaryFromState();
  syncEditResidencyVisibility();
}

const enrollmentCopyByDegree = {
  graduate: {
    "full-time student": "9+ credits per semester",
    "part-time student": "up to 5 credits per semester",
  },
  undergraduate: {
    "full-time student": "12+ credits per semester",
    "part-time student": "up to 6 credits per semester",
  },
};

function syncEnrollmentCopy() {
  const isGrad = estimatorState["degree-type"] === "graduate degree";
  const copy = isGrad ? enrollmentCopyByDegree.graduate : enrollmentCopyByDegree.undergraduate;

  document.querySelectorAll('.inline-select[data-select="enrollment-status"]').forEach((select) => {
    Object.entries(copy).forEach(([value, note]) => {
      const noteEl = select.querySelector(`.select-option[data-value="${value}"] .select-option-note`);
      if (noteEl) noteEl.textContent = note;
    });
  });
}

function isGradCert() {
  return estimatorState["degree-type"] === "graduate certificate";
}

function getArticleForDegreeType(degreeType) {
  return /^[aeiou]/i.test(degreeType) ? "an" : "a";
}

function syncDegreePrefixes() {
  const degreeType = estimatorState["degree-type"];
  const isDefault = degreeType === defaultSelectValues["degree-type"];
  const article = isDefault ? "a" : getArticleForDegreeType(degreeType);

  document.querySelectorAll("[data-degree-prefix]").forEach((el) => {
    el.textContent = `I'm seeking ${article}`;
  });
}

function syncSelectLabels() {
  inlineSelects.forEach((select) => {
    const selectName = select.dataset.select;
    const label = select.querySelector("[data-select-label]");
    const button = select.querySelector(".line-select");
    const hasSelection = estimatorState[selectName] !== defaultSelectValues[selectName];

    select.classList.toggle("has-selection", hasSelection);
    select.classList.toggle("is-custom", selectName === "enrollment-status" && estimatorState[selectName] === "custom");

    if (selectName === "enrollment-status" && estimatorState[selectName] === "custom") {
      if (label) {
        label.textContent =
          estimatorState.credits > 0
            ? `student taking ${estimatorState.credits} credits`
            : defaultSelectValues["enrollment-status"];
      }
      return;
    }

    if (label) {
      label.textContent = estimatorState[selectName];
    }

    if (selectName === "program" && button) {
      if (hasSelection) {
        button.setAttribute("title", estimatorState[selectName]);
      } else {
        button.removeAttribute("title");
      }
    }
  });

  syncDegreePrefixes();
  syncCertProgram();
  syncEnrollmentCopy();
  syncEnrollmentRowVisibility();
}

function syncCertProgram() {
  const certLinks = document.querySelectorAll("[data-cert-program-link]");
  if (!certLinks.length) return;

  const programValue = estimatorState["program"];
  const defaultProgram = defaultSelectValues["program"];
  if (programValue === defaultProgram) return;

  // Use the option's display text (already properly cased) rather than the lowercase state value
  const matchingOption = document.querySelector(
    `.inline-select[data-select="program"] .select-option[data-value="${programValue}"]`
  );
  const displayName = matchingOption
    ? matchingOption.textContent.trim()
    : programValue.replace(/\b\w/g, (c) => c.toUpperCase());

  certLinks.forEach((link) => {
    link.textContent = `${displayName} (Graduate Certificate)`;
  });
}

function syncEnrollmentRowVisibility() {
  const hide = isGradCert();
  document.querySelectorAll('.line-row:has([data-select="enrollment-status"])').forEach((row) => {
    row.hidden = hide;
  });
  // Auto-assign a default enrollment status for grad cert so downstream logic works
  if (hide && estimatorState["enrollment-status"] === defaultSelectValues["enrollment-status"]) {
    estimatorState["enrollment-status"] = "full-time student";
  }
}

function hasStepOneSelection() {
  const required = isGradCert()
    ? ["degree-type", "program"]
    : ["degree-type", "program", "enrollment-status"];
  return required.every(
    (selectName) => estimatorState[selectName] !== defaultSelectValues[selectName]
  );
}

function syncNextButtonState() {
  const isReady = hasStepOneSelection();

  stepOneNextButtons.forEach((button) => {
    button.disabled = !isReady;
    button.setAttribute("aria-disabled", String(!isReady));
  });
}

function openModal() {
  if (feesModal) {
    feesModal.hidden = true;
  }

  modalBackdrop.hidden = false;
  creditModal.hidden = false;
}

function closeModal() {
  modalBackdrop.hidden = true;
  creditModal.hidden = true;

  if (feesModal) {
    feesModal.hidden = true;
  }

  if (exceptionsModal) {
    exceptionsModal.hidden = true;
  }
}

function openExceptionsModal() {
  creditModal.hidden = true;
  if (feesModal) feesModal.hidden = true;
  modalBackdrop.hidden = false;
  exceptionsModal.hidden = false;
}

function openFeesModal() {
  creditModal.hidden = true;

  if (!feesModal) {
    return;
  }

  modalBackdrop.hidden = false;
  feesModal.hidden = false;
}

function renderCreditCount(syncInput = true) {
  if (syncInput && creditCountNode && creditCountNode.value !== String(estimatorState.credits)) {
    creditCountNode.value = String(estimatorState.credits);
  }

  const isOverCreditLimit = estimatorState.credits > MAX_TRANSFER_CREDITS;

  if (creditLimitError) {
    creditLimitError.hidden = !isOverCreditLimit;
  }

  if (creditDisplay) {
    creditDisplay.classList.toggle("is-invalid", isOverCreditLimit);
    creditDisplay.setAttribute("aria-invalid", String(isOverCreditLimit));
  }

  if (creditCountNode) {
    creditCountNode.setAttribute("aria-invalid", String(isOverCreditLimit));
  }

  creditChangeButtons.forEach((button) => {
    const change = Number(button.dataset.creditChange);
    const isDisabled =
      (change < 0 && estimatorState.credits <= 0) ||
      (change > 0 && estimatorState.credits >= MAX_CREDIT_STEPPER_VALUE);

    button.disabled = isDisabled;
    button.setAttribute("aria-disabled", String(isDisabled));
  });

  if (saveCreditLoadButton) {
    saveCreditLoadButton.disabled = isOverCreditLimit;
    saveCreditLoadButton.setAttribute("aria-disabled", String(isOverCreditLimit));
  }
}

function syncDetailInputWidth(input) {
  const valueLength = Math.max((input.value || "0").length, 1);

  input.style.width = `${valueLength + 0.35}ch`;
}

function closeAllSelects() {
  inlineSelects.forEach((select) => {
    const button = select.querySelector(".line-select");
    const menu = select.querySelector(".select-menu");

    select.classList.remove("is-open");
    button?.setAttribute("aria-expanded", "false");
    if (menu) {
      menu.hidden = true;
    }
  });
}

function closeAllTooltips() {
  tooltipTriggers.forEach((trigger) => {
    trigger.classList.remove("is-active");
    trigger.setAttribute("aria-expanded", "false");
  });
}

function openFaqItem(item) {
  const button = item?.querySelector(".faq-button");

  item?.classList.add("is-open");
  button?.setAttribute("aria-expanded", "true");
}

viewChips.forEach((chip) => {
  chip.addEventListener("click", () => setView(chip.dataset.viewTarget));
});

viewTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();

    if (trigger.disabled) {
      return;
    }

    const goView = trigger.dataset.goView;
    // Graduate certificate bypasses step-two entirely and shows the cert result screen
    const targetView = isGradCert() && goView === "step-two"
      ? "cert-result"
      : goView === "resident" && !isFullTimeStudent()
        ? "step-one"
        : goView;

    setView(targetView);

    if (targetView === "results") {
      const scrollTarget = document.querySelector(".gross-cost-row") || document.getElementById("savings-accordion");
      requestAnimationFrame(() => {
        scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});

faqButtons.forEach((button) => {
  const item = button.closest(".faq-item");

  button.setAttribute("aria-expanded", String(item?.classList.contains("is-open")));

  button.addEventListener("click", () => {
    const isOpen = item?.classList.toggle("is-open") ?? false;
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

faqOpenLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const targetItem = targetId ? document.querySelector(targetId) : null;

    if (!targetItem) {
      return;
    }

    event.preventDefault();
    openFaqItem(targetItem);
    history.pushState(null, "", targetId);
    targetItem.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

editResultsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    syncResultsFromState();
    body.dataset.resultsMode = "edit";
  });
});

recalculateResultsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (editStudentTypeSelect) {
      estimatorState["enrollment-status"] = editStudentTypeSelect.value;
    }

    if (editResidentSelect) {
      estimatorState["resident-choice"] = editResidentSelect.value;
    }

    if (editTransferInput) {
      estimatorState.transferCredits = Number(editTransferInput.value || 0);
    }

    if (editGrantsInput) {
      estimatorState.grants = Number(editGrantsInput.value || 0);
    }

    if (editScholarshipsInput) {
      estimatorState.scholarships = Number(editScholarshipsInput.value || 0);
    }

    if (editEmployerBenefitInput) {
      estimatorState.employerBenefit = Number(editEmployerBenefitInput.value || 0);
    }

    syncSelectLabels();
    syncResultsFromState();
    body.dataset.resultsMode = "summary";
  });
});

editStudentTypeSelect?.addEventListener("change", () => {
  estimatorState["enrollment-status"] = editStudentTypeSelect.value;
  syncSelectLabels();
  syncResultsFromState();
});

editResidentSelect?.addEventListener("change", () => {
  estimatorState["resident-choice"] = editResidentSelect.value;
  syncResultsFromState();
});

termHeaders.forEach((header) => {
  const termCard = header.closest(".term-card");
  const termBody = termCard?.querySelector(".term-body");

  header.addEventListener("click", () => {
    const isOpen = !termCard?.classList.contains("is-open");

    termCard?.classList.toggle("is-open", isOpen);
    header.setAttribute("aria-expanded", String(isOpen));

    if (termBody) {
      termBody.hidden = !isOpen;
    }
  });
});

tooltipTriggers.forEach((trigger) => {
  trigger.setAttribute("aria-expanded", "false");

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = !trigger.classList.contains("is-active");

    closeAllTooltips();

    trigger.classList.toggle("is-active", shouldOpen);
    trigger.setAttribute("aria-expanded", String(shouldOpen));
  });
});

feesModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openFeesModal();
  });
});

inlineSelects.forEach((select) => {
  const button = select.querySelector(".line-select");
  const menu = select.querySelector(".select-menu");
  const options = select.querySelectorAll(".select-option");

  menu?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  button?.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !select.classList.contains("is-open");

    closeAllSelects();

    if (!willOpen || !menu) {
      return;
    }

    select.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      if (option.hasAttribute("data-open-modal-option")) {
        estimatorState["enrollment-status"] = "custom";
        syncSelectLabels();
        syncNextButtonState();
        closeAllSelects();
        setView("step-one");
        openModal();
        return;
      }

      estimatorState[select.dataset.select] = option.dataset.value;
      syncSelectLabels();
      syncNextButtonState();
      closeAllSelects();

      if (select.dataset.select === "degree-type" && isGradCert()) {
        // If the user is on the resident panel and switches to grad cert, return to step-one
        if (body.dataset.view === "resident") {
          setView("step-one");
        }
      }

      if (select.dataset.select === "enrollment-status") {
        // Graduate certificate skips the resident panel — stay on step-one
        if (option.dataset.value === "full-time student" && !isGradCert()) {
          setView("resident");
        } else {
          setView("step-one");
        }
      }
    });
  });
});

searchInputs.forEach((input) => {
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const menu = input.closest(".select-menu");
    const options = menu?.querySelectorAll(".select-option");

    options?.forEach((option) => {
      const text = option.textContent.toLowerCase();
      option.hidden = !text.includes(query);
    });
  });
});

detailInputs.forEach((input) => {
  syncDetailInputWidth(input);
  input.addEventListener("input", () => {
    syncDetailInputWidth(input);

    if (input.dataset.stepTwoKey === "transferCredits") {
      estimatorState.transferCredits = Number(input.value || 0);
    }

    if (input.dataset.stepTwoKey === "grants") {
      estimatorState.grants = Number(input.value || 0);
    }

    if (input.dataset.stepTwoKey === "scholarships") {
      estimatorState.scholarships = Number(input.value || 0);
    }

    if (input.dataset.stepTwoKey === "employerBenefit") {
      estimatorState.employerBenefit = Number(input.value || 0);
    }

    syncSummaryFromState();
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelectorAll("[data-open-exceptions-modal]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openExceptionsModal();
  });
});

modalBackdrop.addEventListener("click", closeModal);
document.addEventListener("click", () => {
  closeAllSelects();
  closeAllTooltips();
});
closeAllSelects();

creditChangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    estimatorState.credits += Number(button.dataset.creditChange);
    estimatorState.credits = Math.max(0, Math.min(MAX_CREDIT_STEPPER_VALUE, estimatorState.credits));
    renderCreditCount();
  });
});

creditCountNode.addEventListener("input", () => {
  if (creditCountNode.value === "") {
    estimatorState.credits = 0;
    renderCreditCount(false);
    return;
  }

  const rawValue = Number(creditCountNode.value);
  estimatorState.credits = Number.isFinite(rawValue)
    ? Math.max(0, Math.min(MAX_CREDIT_STEPPER_VALUE, rawValue))
    : 0;
  renderCreditCount();
});

saveCreditLoadButton.addEventListener("click", () => {
  if (estimatorState.credits > MAX_TRANSFER_CREDITS) {
    renderCreditCount();
    return;
  }

  estimatorState["enrollment-status"] = "custom";
  syncSelectLabels();
  syncNextButtonState();
  closeModal();
  setView("step-one");
});

document.querySelectorAll(".toggle-group").forEach((group) => {
  const buttons = group.querySelectorAll(".toggle-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      estimatorState["resident-choice"] = button.dataset.value;
      syncResultsFromState();
    });
  });
});

renderCreditCount();
syncSelectLabels();
syncDegreePrefixes();
syncEnrollmentCopy();
syncNextButtonState();
syncResultsFromState();
closeAllSelects();
setView("step-one");

/* ── Savings accordion ────────────────────────────────────────── */

const SEMESTER_COST = 6515;

const savingsAccordionEl = document.getElementById("savings-accordion");
const savingsHeaderBtn = document.getElementById("savings-header-btn");
const savingsBodyEl = document.getElementById("savings-body");
const savingsFillEl = document.querySelector(".savings-fill");
const priceTotalEl = document.querySelector(".price-total");
const yearTotalRowEl = document.getElementById("year-total-row");
const savingsTotalEl = document.querySelector("[data-savings-total]");
const savingsGrantsEl = document.querySelector("[data-savings-grants]");
const savingsEmployerEl = document.querySelector("[data-savings-employer]");
const savingsEmployerRowEl = document.getElementById("savings-employer-row");
const yearTotalAmountEl = document.querySelector("[data-year-total-amount]");
const grossCostEl = document.querySelector("[data-gross-cost]");
const summaryTotalCostEl = document.querySelector("[data-summary-total-cost]");
const summerTermCardEl = document.getElementById("summer-term-card");
const summerToggleCheckbox = document.querySelector(".summer-toggle input");

let savingsAnimationPlayed = false;
let savingsObserverAttached = false;
let summerIncluded = true;

function getGrossCost() {
  return (summerIncluded ? 3 : 2) * SEMESTER_COST;
}

const COMPLETION_YEARS = 3.5;
const ANNUAL_GROSS = 2 * SEMESTER_COST; // academic year = fall + spring

function syncSavingsFromState() {
  const grantsTotal = estimatorState.grants + estimatorState.scholarships;
  const employerTotal = estimatorState.employerBenefit;
  const totalSavings = grantsTotal + employerTotal;
  const netTotal = Math.max(0, getGrossCost() - totalSavings);
  const annualNet = Math.max(0, ANNUAL_GROSS - totalSavings);

  if (savingsTotalEl) {
    savingsTotalEl.textContent = `−$${formatCurrency(totalSavings)}`;
  }
  if (savingsGrantsEl) {
    savingsGrantsEl.textContent = `−$${formatCurrency(grantsTotal)}`;
  }
  if (savingsEmployerEl) {
    savingsEmployerEl.textContent = `−$${formatCurrency(employerTotal)}`;
  }
  if (savingsEmployerRowEl) {
    savingsEmployerRowEl.hidden = employerTotal === 0;
  }
  if (yearTotalAmountEl) {
    yearTotalAmountEl.textContent = `$${formatCurrency(netTotal)}`;
  }
  if (priceTotalEl) {
    priceTotalEl.textContent = `$${formatCurrency(annualNet)}`;
  }
  if (summaryTotalCostEl) {
    summaryTotalCostEl.textContent = `$${formatCurrency(annualNet * COMPLETION_YEARS)}`;
  }
}

function syncSummerFromState() {
  if (summerTermCardEl) {
    summerTermCardEl.hidden = !summerIncluded;
  }

  const gross = getGrossCost();

  if (grossCostEl) {
    grossCostEl.textContent = `$${formatCurrency(gross)}`;
  }

  syncSavingsFromState();
}

if (summerToggleCheckbox) {
  summerToggleCheckbox.addEventListener("change", () => {
    summerIncluded = summerToggleCheckbox.checked;
    syncSummerFromState();
  });
}

function triggerSavingsAnimation() {
  if (savingsAnimationPlayed) return;
  savingsAnimationPlayed = true;

  if (savingsFillEl && savingsHeaderBtn) {
    savingsFillEl.style.height = savingsHeaderBtn.offsetHeight + "px";
  }

  if (savingsHeaderBtn) {
    savingsHeaderBtn.classList.add("is-animating");
  }

  setTimeout(() => {
    if (priceTotalEl) priceTotalEl.style.opacity = "1";
    if (yearTotalRowEl) yearTotalRowEl.style.opacity = "1";
  }, 1800);
}

function initSavingsAnimation() {
  if (savingsAnimationPlayed) return;

  if (priceTotalEl && !priceTotalEl.style.transition) {
    priceTotalEl.style.transition = "opacity 0.5s ease";
  }
  if (priceTotalEl) priceTotalEl.style.opacity = "0";

  if (yearTotalRowEl && !yearTotalRowEl.style.transition) {
    yearTotalRowEl.style.transition = "opacity 0.5s ease";
  }
  if (yearTotalRowEl) yearTotalRowEl.style.opacity = "0";

  if (savingsObserverAttached || !savingsAccordionEl) return;
  savingsObserverAttached = true;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerSavingsAnimation();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(savingsAccordionEl);
}

if (savingsHeaderBtn && savingsBodyEl) {
  savingsHeaderBtn.addEventListener("click", () => {
    const isOpen = !savingsAccordionEl.classList.contains("is-open");
    savingsAccordionEl.classList.toggle("is-open", isOpen);
    savingsHeaderBtn.setAttribute("aria-expanded", String(isOpen));
    savingsBodyEl.hidden = !isOpen;
  });
}

/* Hook savings sync into existing state updates */
const _origSyncResults = syncResultsFromState;
syncResultsFromState = function () {
  _origSyncResults();
  syncSummerFromState();
};

/* Hook animation init into setView */
const _origSetView = setView;
setView = function (view) {
  _origSetView(view);
  if (view === "results") {
    syncSummerFromState();
    initSavingsAnimation();
  }
};

/* ── Start over ───────────────────────────────────────────────────── */

function resetEstimatorState() {
  // Reset all selections to defaults
  estimatorState["degree-type"] = defaultSelectValues["degree-type"];
  estimatorState["program"] = defaultSelectValues["program"];
  estimatorState["enrollment-status"] = defaultSelectValues["enrollment-status"];
  estimatorState["resident-choice"] = "no";
  estimatorState.credits = 0;
  estimatorState.transferCredits = 0;
  estimatorState.grants = 0;
  estimatorState.scholarships = 0;
  estimatorState.employerBenefit = 0;

  // Reset resident toggle buttons — no default selection
  document.querySelectorAll(".toggle-group").forEach((group) => {
    group.querySelectorAll(".toggle-button").forEach((btn) => {
      btn.classList.remove("is-selected");
    });
  });

  // Reset savings animation so it plays again on the next results view
  savingsAnimationPlayed = false;
  savingsObserverAttached = false;

  syncSelectLabels();
  syncDegreePrefixes();
  syncNextButtonState();
  renderCreditCount();
}

document.querySelectorAll(".restart-link").forEach((link) => {
  link.addEventListener("click", () => {
    resetEstimatorState();
  });
});

/* ── Residency / tuition widget (FAQ: out-of-state tuition item) ── */

/* PLACEHOLDER RATES — swap in real 25/26 per-credit numbers here. */
const residencyWidgetConfig = {
  rates: {
    undergraduate: { perCredit: 537.36, capCredits: 11 },
    graduate: { perCredit: 766.27, capCredits: 11 },
  },
  maxCredits: 18,
  yMax: 15000,
  yStep: 3000,
};

(function initResidencyWidget() {
  const widget = document.querySelector(".residency-widget");
  const chartHost = widget?.querySelector("[data-rw-chart]");

  if (!widget || !chartHost) {
    return;
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  const MAROON = "#8c1d40";
  const state = { residency: "resident", level: "undergraduate", hoverCredits: null };
  const mobileQuery = window.matchMedia("(max-width: 640px)");

  const layouts = {
    desktop: {
      width: 1100, height: 440,
      margin: { top: 24, right: 36, bottom: 64, left: 84 },
      fontSize: 12, tickEvery: 1,
    },
    mobile: {
      width: 380, height: 320,
      margin: { top: 16, right: 22, bottom: 56, left: 64 },
      fontSize: 11, tickEvery: 3,
    },
  };

  function el(name, attrs, textContent) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (textContent !== undefined) {
      node.textContent = textContent;
    }
    return node;
  }

  function formatMoney(value) {
    return `$${Math.round(value).toLocaleString("en-US")}`;
  }

  function getSeries() {
    const cfg = residencyWidgetConfig;
    const { perCredit, capCredits } = cfg.rates[state.level];
    const capTuition = perCredit * capCredits;
    const endTuition = state.residency === "resident" ? capTuition : perCredit * cfg.maxCredits;
    return { perCredit, capCredits, capTuition, endTuition };
  }

  function getTuitionForCredits(credits) {
    const { perCredit, capCredits, capTuition } = getSeries();
    const tuition = perCredit * credits;
    return state.residency === "resident" ? Math.min(tuition, capTuition) : tuition;
  }

  function chartAriaLabel() {
    const { capCredits, capTuition } = getSeries();
    const level = state.level === "undergraduate" ? "undergraduate" : "graduate";
    return state.residency === "resident"
      ? `Line chart of estimated ${level} tuition per semester by credit load. As an Arizona resident, tuition rises per credit until ${capCredits} credit hours (${formatMoney(capTuition)}), then stays flat: additional credits do not increase tuition.`
      : `Line chart of estimated ${level} tuition per semester by credit load. As a nonresident, tuition keeps increasing with each credit through ${residencyWidgetConfig.maxCredits} credits, with no tuition cap.`;
  }

  let refs = null;

  function buildChart() {
    const cfg = residencyWidgetConfig;
    const L = mobileQuery.matches ? layouts.mobile : layouts.desktop;
    const plotW = L.width - L.margin.left - L.margin.right;
    const plotH = L.height - L.margin.top - L.margin.bottom;
    const x = (credits) => L.margin.left + (credits / cfg.maxCredits) * plotW;
    const y = (tuition) => L.margin.top + (1 - tuition / cfg.yMax) * plotH;

    const svg = el("svg", {
      viewBox: `0 0 ${L.width} ${L.height}`,
      role: "img",
      tabindex: "0",
      "aria-label": chartAriaLabel(),
    });

    const defs = el("defs", {});
    const gradient = el("linearGradient", { id: "rw-fill-gradient", x1: "0", y1: "0", x2: "0", y2: "1" });
    gradient.appendChild(el("stop", { offset: "0%", "stop-color": MAROON, "stop-opacity": "0.14" }));
    gradient.appendChild(el("stop", { offset: "100%", "stop-color": MAROON, "stop-opacity": "0" }));
    defs.appendChild(gradient);
    const marker = el("marker", {
      id: "rw-arrow", viewBox: "0 0 10 10", refX: "8", refY: "5",
      markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse",
    });
    marker.appendChild(el("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: MAROON }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    /* Gridlines + y tick labels */
    for (let v = 0; v <= cfg.yMax; v += cfg.yStep) {
      const gy = y(v);
      svg.appendChild(el("line", {
        x1: L.margin.left, y1: gy, x2: L.width - L.margin.right, y2: gy,
        stroke: v === 0 ? "#d0d0d0" : "#e6e6e6", "stroke-width": "1",
      }));
      svg.appendChild(el("text", {
        x: L.margin.left - 10, y: gy + 4, "text-anchor": "end",
        "font-size": L.fontSize, fill: "#747474",
      }, `$${v.toLocaleString("en-US")}`));
    }

    /* X tick labels */
    for (let c = 0; c <= cfg.maxCredits; c += 1) {
      if (c % L.tickEvery !== 0) continue;
      svg.appendChild(el("text", {
        x: x(c), y: y(0) + 22, "text-anchor": "middle",
        "font-size": L.fontSize, fill: "#747474",
      }, String(c)));
    }

    /* Axis titles */
    const yTitleX = 16;
    const yTitleY = L.margin.top + plotH / 2;
    svg.appendChild(el("text", {
      x: yTitleX, y: yTitleY, "text-anchor": "middle",
      "font-size": L.fontSize, "font-weight": "700", fill: "#747474",
      transform: `rotate(-90 ${yTitleX} ${yTitleY})`,
    }, "Tuition*"));
    svg.appendChild(el("text", {
      x: L.margin.left + plotW / 2, y: L.height - 10, "text-anchor": "middle",
      "font-size": L.fontSize, "font-weight": "700", fill: "#747474",
    }, "Credits per semester"));

    /* Series */
    const fill = el("path", { class: "rw-fill", fill: "url(#rw-fill-gradient)", stroke: "none" });
    const line = el("path", {
      class: "rw-line", fill: "none", stroke: MAROON,
      "stroke-width": "2.5", "stroke-linejoin": "round",
    });
    svg.appendChild(fill);
    svg.appendChild(line);

    /* Hover annotation (dashed line, dot, tooltip chip) */
    const capGroup = el("g", { class: "rw-cap-group" });
    const dash = el("line", {
      stroke: "#b9b9b9", "stroke-width": "1.5", "stroke-dasharray": "4 5",
    });
    const dot = el("circle", { r: "7", fill: MAROON, stroke: "#fff", "stroke-width": "2" });
    const chip = el("g", { class: "rw-chip" });
    const chipW = 104;
    const chipH = 46;
    chip.appendChild(el("rect", {
      width: chipW, height: chipH, rx: "4",
      fill: "#fafafa", stroke: "#d0d0d0", "stroke-width": "1",
    }));
    chip.appendChild(el("text", { x: 9, y: 19, "font-size": "11", fill: "#747474" }, "Credits"));
    const chipCredits = el("text", {
      x: 60, y: 19, "font-size": "11", "font-weight": "700", fill: "#191919",
    });
    chip.appendChild(chipCredits);
    chip.appendChild(el("text", { x: 9, y: 37, "font-size": "11", fill: "#747474" }, "Tuition*"));
    const chipTuition = el("text", {
      x: 60, y: 37, "font-size": "11", "font-weight": "700", fill: "#191919",
    });
    chip.appendChild(chipTuition);
    capGroup.appendChild(dash);
    capGroup.appendChild(dot);
    capGroup.appendChild(chip);
    svg.appendChild(capGroup);

    const hitArea = el("rect", {
      class: "rw-hit-area",
      x: L.margin.left,
      y: L.margin.top,
      width: plotW,
      height: plotH,
      fill: "transparent",
      tabindex: "-1",
    });
    svg.appendChild(hitArea);

    chartHost.replaceChildren(svg);
    refs = { svg, fill, line, capGroup, dash, dot, chip, chipCredits, chipTuition, x, y, L, plotW, chipW, chipH };

    function setCreditsFromPointer(event) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      const rawCredits = ((svgPoint.x - L.margin.left) / plotW) * cfg.maxCredits;
      state.hoverCredits = Math.max(0, Math.min(cfg.maxCredits, Math.round(rawCredits)));
      updateChart();
    }

    hitArea.addEventListener("pointerenter", setCreditsFromPointer);
    hitArea.addEventListener("pointermove", setCreditsFromPointer);
    hitArea.addEventListener("pointerleave", () => {
      state.hoverCredits = null;
      updateChart();
    });

    svg.addEventListener("focus", () => {
      state.hoverCredits = state.hoverCredits ?? getSeries().capCredits;
      updateChart();
    });

    svg.addEventListener("blur", () => {
      state.hoverCredits = null;
      updateChart();
    });

    svg.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const currentCredits = state.hoverCredits ?? getSeries().capCredits;
      if (event.key === "Home") {
        state.hoverCredits = 0;
      } else if (event.key === "End") {
        state.hoverCredits = cfg.maxCredits;
      } else {
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        state.hoverCredits = Math.max(0, Math.min(cfg.maxCredits, currentCredits + direction));
      }
      updateChart();
    });
  }

  function updateChart() {
    const cfg = residencyWidgetConfig;
    const { capCredits, capTuition, endTuition } = getSeries();
    const { svg, fill, line, capGroup, dash, dot, chip, chipCredits, chipTuition, x, y, L, plotW, chipW, chipH } = refs;
    const isResident = state.residency === "resident";

    const x0 = x(0);
    const y0 = y(0);
    const xCap = x(capCredits);
    const yCap = y(capTuition);
    const xEnd = x(cfg.maxCredits);
    const yEnd = y(endTuition);

    line.setAttribute("d", `M ${x0} ${y0} L ${xCap} ${yCap} L ${xEnd} ${yEnd}`);
    fill.setAttribute("d", `M ${x0} ${y0} L ${xCap} ${yCap} L ${xEnd} ${yEnd} L ${xEnd} ${y0} L ${x0} ${y0} Z`);

    if (isResident) {
      line.setAttribute("marker-end", "url(#rw-arrow)");
    } else {
      line.removeAttribute("marker-end");
    }

    const activeCredits = state.hoverCredits ?? capCredits;
    const activeTuition = getTuitionForCredits(activeCredits);
    const activeX = x(activeCredits);
    const activeY = y(activeTuition);
    const chipGap = 14;
    const chipX = Math.max(L.margin.left + 4, Math.min(activeX - chipW - chipGap, L.margin.left + plotW - chipW - 4));
    const chipY = Math.max(L.margin.top + 4, activeY - chipH - 8);

    dot.style.opacity = "1";
    dash.setAttribute("x1", activeX);
    dash.setAttribute("x2", activeX);
    dash.setAttribute("y1", L.margin.top);
    dash.setAttribute("y2", y0);
    dot.setAttribute("cx", activeX);
    dot.setAttribute("cy", activeY);
    chip.setAttribute("transform", `translate(${chipX} ${chipY})`);
    chipCredits.textContent = String(activeCredits);
    chipTuition.textContent = formatMoney(activeTuition);

    svg.setAttribute("aria-label", chartAriaLabel());
  }

  widget.querySelectorAll("[data-rw-residency]").forEach((button) => {
    button.addEventListener("click", () => {
      state.residency = button.dataset.rwResidency;
      state.hoverCredits = null;
      widget.querySelectorAll("[data-rw-residency]").forEach((pill) => {
        const selected = pill === button;
        pill.classList.toggle("is-selected", selected);
        pill.setAttribute("aria-checked", String(selected));
      });
      updateChart();
    });
  });

  widget.querySelectorAll("[data-rw-level]").forEach((button) => {
    button.addEventListener("click", () => {
      state.level = button.dataset.rwLevel;
      state.hoverCredits = null;
      widget.querySelectorAll("[data-rw-level]").forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle("is-selected", selected);
        tab.setAttribute("aria-checked", String(selected));
      });
      updateChart();
    });
  });

  mobileQuery.addEventListener("change", () => {
    state.hoverCredits = null;
    buildChart();
    updateChart();
  });

  buildChart();
  updateChart();
})();

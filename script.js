const body = document.body;
const viewChips = document.querySelectorAll("[data-view-target]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const viewTriggers = document.querySelectorAll("[data-go-view]");
const faqButtons = document.querySelectorAll(".faq-button");
const faqOpenLinks = document.querySelectorAll("[data-open-faq]");
const modalBackdrop = document.querySelector(".modal-backdrop");
const creditModal = document.querySelector(".credit-modal");
const feesModal = document.querySelector(".fees-modal");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const feesModalTriggers = document.querySelectorAll("[data-open-fees-modal]");
const creditCountNode = document.getElementById("credit-count");
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
    summaryLabel.textContent = `Your semester total for ${getCreditsPerSemesterLabel()}:`;
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

function syncSelectLabels() {
  inlineSelects.forEach((select) => {
    const selectName = select.dataset.select;
    const label = select.querySelector("[data-select-label]");
    const hasSelection = estimatorState[selectName] !== defaultSelectValues[selectName];

    select.classList.toggle("has-selection", hasSelection);
    select.classList.toggle("is-custom", selectName === "enrollment-status" && estimatorState[selectName] === "custom");

    if (selectName === "enrollment-status" && estimatorState[selectName] === "custom") {
      if (label) {
        label.textContent =
          estimatorState.credits > 0
            ? `Custom: ${estimatorState.credits} credits`
            : defaultSelectValues["enrollment-status"];
      }
      return;
    }

    if (label) {
      label.textContent = estimatorState[selectName];
    }
  });
}

function hasStepOneSelection() {
  return ["degree-type", "program", "enrollment-status"].every(
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
}

function openFeesModal() {
  creditModal.hidden = true;

  if (!feesModal) {
    return;
  }

  modalBackdrop.hidden = false;
  feesModal.hidden = false;
}

function renderCreditCount() {
  creditCountNode.textContent = String(estimatorState.credits);
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

    const targetView =
      trigger.dataset.goView === "resident" && !isFullTimeStudent() ? "step-one" : trigger.dataset.goView;

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

      if (select.dataset.select === "enrollment-status") {
        if (option.dataset.value === "full-time student") {
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

modalBackdrop.addEventListener("click", closeModal);
document.addEventListener("click", () => {
  closeAllSelects();
  closeAllTooltips();
});
closeAllSelects();

creditChangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    estimatorState.credits += Number(button.dataset.creditChange);
    estimatorState.credits = Math.max(0, estimatorState.credits);
    renderCreditCount();
  });
});

saveCreditLoadButton.addEventListener("click", () => {
  estimatorState["enrollment-status"] = "custom";
  syncSelectLabels();
  syncNextButtonState();
  closeModal();
  setView("step-one");
});

const residentHelpNo = document.querySelector('[data-resident-help="no"]');
const residentHelpYes = document.querySelector('[data-resident-help="yes"]');

function syncResidentHelp(choice) {
  if (residentHelpNo) residentHelpNo.hidden = choice === "yes";
  if (residentHelpYes) residentHelpYes.hidden = choice !== "yes";
}

document.querySelectorAll(".toggle-group").forEach((group) => {
  const buttons = group.querySelectorAll(".toggle-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      estimatorState["resident-choice"] = button.textContent.trim().toLowerCase();
      syncResidentHelp(estimatorState["resident-choice"]);
      syncResultsFromState();
    });
  });
});

renderCreditCount();
syncSelectLabels();
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

function syncSavingsFromState() {
  const grantsTotal = estimatorState.grants + estimatorState.scholarships;
  const employerTotal = estimatorState.employerBenefit;
  const totalSavings = grantsTotal + employerTotal;
  const netTotal = Math.max(0, getGrossCost() - totalSavings);

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
}

function syncSummerFromState() {
  if (summerTermCardEl) {
    summerTermCardEl.hidden = !summerIncluded;
  }

  const gross = getGrossCost();

  if (grossCostEl) {
    grossCostEl.textContent = `$${formatCurrency(gross)}`;
  }
  if (summaryTotalCostEl) {
    summaryTotalCostEl.textContent = `$${formatCurrency(gross)}`;
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

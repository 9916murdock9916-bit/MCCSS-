const statusEl = document.getElementById("ef-status");
const views = document.querySelectorAll(".ef-view");
const navButtons = document.querySelectorAll(".ef-nav button");

function setStatus(text) {
  statusEl.textContent = text;
}

function showView(name) {
  views.forEach(v => {
    v.classList.toggle("active", v.id === `view-${name}`);
  });
}

function initNav() {
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-view");
      showView(target);
      setStatus(`Viewing: ${target}`);
    });
  });
}

function bootSubstrate() {
  setStatus("Substrate ready");
  showView("home");
  initNav();
  console.log("[Eden Field] Interface shell online.");
}

bootSubstrate();

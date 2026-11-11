// ---------- State ----------
let extensions = [];
let currentFilter = "all";

// ---------- Elements ----------
const listEl = document.getElementById("extension-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const themeBtn = document.getElementById("theme-btn");
const themeIcon = document.getElementById("theme-icon");

// ---------- Load data ----------
async function loadData() {
  try {
    const res = await fetch("./data.json");
    extensions = await res.json();
    render();
  } catch (err) {
    listEl.innerHTML =
      '<p class="message">Could not load data.json. Open this project with a local server (for example the VS Code "Live Server" extension).</p>';
    console.error(err);
  }
}

// ---------- Render ----------
function render() {
  const visible = extensions.filter((ext) => {
    if (currentFilter === "active") return ext.isActive;
    if (currentFilter === "inactive") return !ext.isActive;
    return true;
  });

  if (visible.length === 0) {
    listEl.innerHTML = '<p class="message">No extensions to show.</p>';
    return;
  }

  listEl.innerHTML = visible
    .map(
      (ext) => `
    <article class="card">
      <div class="card-top">
        <img src="${ext.logo}" alt="" />
        <div>
          <h2>${ext.name}</h2>
          <p>${ext.description}</p>
        </div>
      </div>
      <div class="card-bottom">
        <button class="remove-btn" data-name="${ext.name}">Remove</button>
        <button class="switch" role="switch"
          aria-checked="${ext.isActive}"
          aria-label="Toggle ${ext.name}"
          data-name="${ext.name}"></button>
      </div>
    </article>`
    )
    .join("");
}

// ---------- Toggle + Remove (event delegation) ----------
listEl.addEventListener("click", (e) => {
  const switchBtn = e.target.closest(".switch");
  const removeBtn = e.target.closest(".remove-btn");

  if (switchBtn) {
    const ext = extensions.find((x) => x.name === switchBtn.dataset.name);
    ext.isActive = !ext.isActive;
    render();
    // keep keyboard focus on the same switch after re-render
    const again = listEl.querySelector(
      `.switch[data-name="${CSS.escape(ext.name)}"]`
    );
    if (again) again.focus();
  }

  if (removeBtn) {
    extensions = extensions.filter((x) => x.name !== removeBtn.dataset.name);
    render();
  }
});

// ---------- Filters ----------
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

// ---------- Theme ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  themeIcon.src = isDark
    ? "./assets/images/icon-sun.svg"
    : "./assets/images/icon-moon.svg";
  themeBtn.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme"
  );
  localStorage.setItem("theme", theme);
}

themeBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

const savedTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(savedTheme);

// ---------- Start ----------
loadData();
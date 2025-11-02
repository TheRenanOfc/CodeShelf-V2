// ==================== Seletores ====================
const startModal = document.getElementById("startModal");
const userForm = document.getElementById("userForm");
const usernameInput = document.getElementById("usernameInput");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const userInfoEl = document.getElementById("userInfo");
const repoListEl = document.getElementById("repoList");

const repoPopup = document.getElementById("repoPopup");
const popupContent = document.getElementById("popupContent");
const closePopup = document.getElementById("closePopup");

const changeImagePopup = document.getElementById("changeImagePopup");
const uploadBtn = document.getElementById("uploadBtn");
const urlInput = document.getElementById("urlInput");
const cancelChange = document.getElementById("cancelChange");
const confirmChange = document.getElementById("confirmChange");

const repoFilters = document.getElementById("repoFilters");
const languageFilter = document.getElementById("languageFilter");
const sortFilter = document.getElementById("sortFilter");

let currentRepos = [];
let customImages = JSON.parse(localStorage.getItem("codeshelf_custom_images") || "{}");
let selectedRepoId = null;

// ==================== Splash ====================
const splash = document.getElementById("splash");
const splashLogo = document.getElementById("splashLogo");
window.addEventListener("load", () => {
  splashLogo.classList.add("animate-logo");
  setTimeout(() => {
    splash.style.display = "none";
    startModal.classList.remove("hidden");
  }, 1500);
});

// ==================== Scroll topo ====================
window.onbeforeunload = () => window.scrollTo(0, 0);

// ==================== Loading/Error ====================
function showLoading(show) {
  loadingEl.classList.toggle("hidden", !show);
}
function showError(msg = "") {
  if (!msg) return errorEl.classList.add("hidden");
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
}

// ==================== Buscar GitHub ====================
async function fetchGitHubUser(username) {
  showLoading(true);
  showError("");
  userInfoEl.classList.add("hidden");
  repoListEl.classList.add("hidden");
  try {
    const [userRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=200&sort=updated`)
    ]);
    if (!userRes.ok) throw new Error("Usuário não encontrado.");
    if (!repoRes.ok) throw new Error("Erro ao carregar repositórios.");
    const user = await userRes.json();
    const repos = await repoRes.json();
    currentRepos = repos;
    renderUser(user);
    renderRepos();
    localStorage.setItem("codeshelf_last_user", username);
    startModal.classList.add("hidden");
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
}

// ==================== Render User ====================
function renderUser(user) {
  userInfoEl.innerHTML = `
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 fade-in">
      <img src="${user.avatar_url}" class="w-20 h-20 rounded-lg shadow-2xl">
      <div>
        <div class="text-xl font-semibold">${user.name || user.login}</div>
        <div class="text-sm text-gray-400">${user.bio || ""}</div>
        <div class="mt-2 text-xs text-gray-400 flex gap-4 flex-wrap">
          <div>Repos: ${user.public_repos}</div>
          <div>Followers: ${user.followers}</div>
          <div>Following: ${user.following}</div>
        </div>
      </div>
      <div class="ml-auto flex gap-2 flex-wrap mt-2 sm:mt-0">
        ${user.blog ? `<a href="${user.blog}" target="_blank" class="text-sm px-3 py-2 bg-gray-800/50 rounded-md">Website</a>` : ""}
        <a href="${user.html_url}" target="_blank" class="text-sm px-3 py-2 bg-indigo-600 rounded-md">GitHub</a>
      </div>
    </div>`;
  userInfoEl.classList.remove("hidden");
}

// ==================== Atualiza filtros ====================
function updateFilters() {
  const langs = new Set();
  currentRepos.forEach(repo => { if (repo.language) langs.add(repo.language); });
  const selectedLang = languageFilter.value || "";
  languageFilter.innerHTML = `<option value="">Todas as linguagens</option>` +
    [...langs].sort().map(l => `<option value="${l}" ${l === selectedLang ? 'selected' : ''}>${l}</option>`).join('');
  repoFilters.classList.remove("hidden");
}

// ==================== Render Repos ====================
function renderRepos() {
  let filtered = [...currentRepos];

  const langValue = languageFilter.value;
  if (langValue) filtered = filtered.filter(r => r.language === langValue);

  const sortValue = sortFilter.value;
  if (sortValue === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortValue === "stars") filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
  else if (sortValue === "forks") filtered.sort((a, b) => b.forks_count - a.forks_count);
  else if (sortValue === "updated") filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  if (!filtered.length) {
    repoListEl.innerHTML = `<p class="text-gray-400 mt-6">Nenhum repositório encontrado.</p>`;
    repoListEl.classList.remove("hidden");
    return;
  }

  repoListEl.innerHTML = `<div class="grid">${filtered.map(repo => {
    return `<div class="card p-3 shadow-lg fade-in show">
      <div class="relative">
        <img src="${customImages[repo.id] || repo.owner.avatar_url}" class="rounded-md" onclick="openRepoPopup(${repo.id})">
        <div class="absolute top-2 left-2 flex gap-1">
          <button onclick="event.stopPropagation(); openChangeImage(${repo.id})" class="text-xs px-2 py-1 bg-black/40 backdrop-blur rounded-md border border-gray-700">Alterar</button>
          <button onclick="event.stopPropagation(); resetRepoImage(${repo.id})" class="text-xs px-2 py-1 bg-black/40 backdrop-blur rounded-md border border-gray-700">Reset</button>
        </div>
        <div class="card-summary">
          <div class="card-name truncate">${repo.name}</div>
          <div class="card-lang-bar-container">
            ${repo.language ? `<div class="card-lang-bar" style="background:${randomColor(repo.language)}" data-width="100%"></div>` : ""}
          </div>
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;

  repoListEl.classList.remove("hidden");

  // Animação barras
  document.querySelectorAll(".card-lang-bar").forEach(bar => { setTimeout(() => { bar.style.width = bar.dataset.width; }, 50); });

  updateFilters();
}

// ==================== Popup detalhado ====================
async function openRepoPopup(repoId) {
  const repo = currentRepos.find(r => r.id === repoId); if (!repo) return;
  let languages = {};
  try { languages = await (await fetch(repo.languages_url)).json(); } catch (err) { console.warn(err); }
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const createdAt = new Date(repo.created_at).toLocaleDateString();
  const updatedAt = new Date(repo.updated_at).toLocaleDateString();
  const langBars = Object.entries(languages).map(([lang, bytes]) => {
    const w = (bytes / totalBytes * 100).toFixed(1);
    return `<div class="lang-bar" style="background:${randomColor(lang)};" data-width="${w}%"></div>`;
  }).join('');
  popupContent.innerHTML = `
    <h2>${repo.name}</h2>
    <img src="${customImages[repo.id] || repo.owner.avatar_url}" alt="${repo.name}">
    <p>${repo.description || "Sem descrição detalhada"}</p>
    ${langBars ? `<div class="lang-bar-container">${langBars}</div>` : ""}
    <p><strong>Forks:</strong> ${repo.forks_count} | <strong>Estrelas:</strong> ${repo.stargazers_count} | <strong>Issues:</strong> ${repo.open_issues_count}</p>
    <p><strong>Criado em:</strong> ${createdAt} | <strong>Atualizado:</strong> ${updatedAt}</p>
    <div class="popup-buttons">
      ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="site">Site</a>` : ""}
      <a href="${repo.html_url}" target="_blank" class="github">GitHub</a>
    </div>`;
  repoPopup.classList.remove("hidden");
  document.querySelectorAll(".lang-bar").forEach(bar => { setTimeout(() => { bar.style.width = bar.dataset.width; }, 50); });
}

// ==================== Alterar imagem ====================
const fileInput = document.createElement("input"); fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.addEventListener("change", handleFilePick); document.body.appendChild(fileInput);
function openChangeImage(repoId) { selectedRepoId = repoId; urlInput.value = ""; changeImagePopup.classList.remove("hidden"); }
uploadBtn.addEventListener("click", () => fileInput.click());
cancelChange.addEventListener("click", () => changeImagePopup.classList.add("hidden"));
confirmChange.addEventListener("click", () => {
  if (!selectedRepoId) return;
  const url = urlInput.value.trim();
  if (url) { customImages[selectedRepoId] = url; localStorage.setItem("codeshelf_custom_images", JSON.stringify(customImages)); renderRepos(); changeImagePopup.classList.add("hidden"); selectedRepoId = null; }
});
function handleFilePick(e) {
  const file = e.target.files[0]; if (!file || !selectedRepoId) return;
  const reader = new FileReader();
  reader.onload = () => { customImages[selectedRepoId] = reader.result; localStorage.setItem("codeshelf_custom_images", JSON.stringify(customImages)); renderRepos(); selectedRepoId = null; changeImagePopup.classList.add("hidden"); };
  reader.readAsDataURL(file); e.target.value = "";
}
function resetRepoImage(repoId) { delete customImages[repoId]; localStorage.setItem("codeshelf_custom_images", JSON.stringify(customImages)); renderRepos(); }

// ==================== Popup controle ====================
closePopup.addEventListener("click", () => repoPopup.classList.add("hidden"));
repoPopup.addEventListener("click", e => { if (e.target === repoPopup) repoPopup.classList.add("hidden"); });

// ==================== Filtros ====================
languageFilter.addEventListener("change", renderRepos);
sortFilter.addEventListener("change", renderRepos);

// ==================== Cores aleatórias ====================
function randomColor(lang) { const colors = ["#f97316", "#facc15", "#10b981", "#6366f1", "#ec4899", "#14b8a6"]; return colors[lang.length % colors.length]; }

// ==================== Form & Search ====================
userForm.addEventListener("submit", e => { e.preventDefault(); const u = usernameInput.value.trim(); if (u) fetchGitHubUser(u); });
searchBtn.addEventListener("click", () => { const u = searchInput.value.trim(); if (u) fetchGitHubUser(u); });

// ==================== Carregar último usuário ====================
const lastUser = localStorage.getItem("codeshelf_last_user");
if (lastUser) { searchInput.value = lastUser; fetchGitHubUser(lastUser); startModal.classList.add("hidden"); }

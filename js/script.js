// ============================================================
// Portfólio — JavaScript puro
// 1. Menu do celular   2. Tema claro/escuro
// 3. Link ativo no menu   4. Animação ao rolar   5. Ano no rodapé
// ============================================================

const THEME_KEY = "portfolio:tema";

// ---------- 1. Menu do celular ----------
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

function setMenuOpen(isOpen) {
  menu.classList.toggle("nav__menu--open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  menuToggle.textContent = isOpen ? "✕" : "☰";
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

// Fecha o menu ao clicar num link (no celular)
menu.addEventListener("click", (event) => {
  if (event.target.matches(".nav__link")) setMenuOpen(false);
});

// Fecha com a tecla Esc
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

// ---------- 2. Tema claro/escuro ----------
const themeToggle = document.getElementById("theme-toggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function currentTheme() {
  return document.documentElement.dataset.theme || (prefersDark.matches ? "dark" : "light");
}

function updateThemeButton() {
  const isDark = currentTheme() === "dark";
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
}

themeToggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // modo anônimo: o tema só não fica salvo
  }
  updateThemeButton();
});

updateThemeButton();

// ---------- 3. Link ativo no menu conforme a seção visível ----------
const links = document.querySelectorAll(".nav__link");
const sections = document.querySelectorAll("main section[id]");

// IntersectionObserver avisa quando um elemento entra/sai da tela
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("nav__link--active", isActive);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" } // conta como "ativa" a seção no meio da tela
);

sections.forEach((section) => sectionObserver.observe(section));

// ---------- 4. Animação de entrada ao rolar ----------
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
        observer.unobserve(entry.target); // anima só uma vez
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".section").forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// ---------- 5. Ano atual no rodapé ----------
document.getElementById("ano").textContent = new Date().getFullYear();

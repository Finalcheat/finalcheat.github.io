const root = document.documentElement;
const translations = JSON.parse(
  document.getElementById("site-messages").textContent,
);
for (const link of document.querySelectorAll("[data-language-link]")) {
  const syncLanguageLink = () => {
    const target = new URL(link.href);
    target.hash = location.hash;
    link.href = target.href;
  };
  syncLanguageLink();
  addEventListener("hashchange", syncLanguageLink);
}
const themeButton = document.querySelector(".theme-toggle");
function syncTheme() {
  const dark = root.dataset.theme === "dark";
  themeButton?.setAttribute("aria-pressed", String(dark));
  themeButton?.setAttribute(
    "aria-label",
    dark ? translations.common.light : translations.common.dark,
  );
  if (themeButton)
    themeButton.title = dark
      ? translations.common.light
      : translations.common.dark;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#141c18" : "#f7f8f5");
}
syncTheme();
themeButton?.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("finalcheat.theme", root.dataset.theme);
  } catch {
    /* Storage can be disabled. */
  }
  syncTheme();
});

const tabs = [...document.querySelectorAll("[data-screenshot]")];
function activateScreenshot(tab) {
  const english = tab.dataset.screenshot === "en";
  for (const item of tabs) {
    item.setAttribute("aria-selected", String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  }
  const image = document.querySelector("[data-screenshot-image]");
  image.src = english ? image.dataset.srcEn : image.dataset.srcZh;
  image.alt = english
    ? translations.home.screenAltEn
    : translations.home.screenAltZh;
  document
    .querySelector("#screenshot-panel")
    .setAttribute("aria-labelledby", tab.id);
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener("click", () => activateScreenshot(tab));
  tab.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    tabs[next].focus();
    activateScreenshot(tabs[next]);
  });
}

for (const button of document.querySelectorAll("[data-copy]")) {
  const idle = button.innerHTML;
  let timer;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        document.getElementById(button.dataset.copy).textContent,
      );
      button.textContent = translations.messages.copied;
    } catch {
      button.textContent = translations.messages.copyFailed;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      button.innerHTML = idle;
    }, 1800);
  });
}

const search = document.querySelector("#chapter-search");
const chapterLinks = [...document.querySelectorAll("[data-chapter]")];
const toc = document.querySelector(".mobile-toc");
const small = window.matchMedia("(max-width: 760px)");
function syncToc() {
  if (toc) toc.open = !small.matches;
}
syncToc();
small.addEventListener("change", syncToc);
search?.addEventListener("input", () => {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const link of chapterLinks) {
    const match =
      !query || link.dataset.search.toLocaleLowerCase().includes(query);
    link.hidden = !match;
    if (match) count++;
  }
  for (const group of document.querySelectorAll(".nav-group")) {
    group.hidden = ![...group.querySelectorAll("a")].some((a) => !a.hidden);
  }
  const message = document.querySelector("[data-search-message]");
  message.hidden = !query;
  message.textContent = count
    ? translations.messages.found.replace("{count}", String(count))
    : translations.messages.notFound;
  if (query) toc.open = true;
});
search?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    search.value = "";
    search.dispatchEvent(new Event("input"));
    search.blur();
  }
  if (event.key === "Enter") {
    const match = chapterLinks.find((a) => !a.hidden);
    if (match) match.click();
  }
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    search &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    search.focus();
  }
});
for (const link of chapterLinks) {
  link.addEventListener("click", () => {
    if (small.matches) toc.open = false;
  });
}

const referenceSections = [...document.querySelectorAll(".reference-section")];
if (referenceSections.length) {
  let scheduled = false;
  function updateReading() {
    scheduled = false;
    const current =
      referenceSections.findLast(
        (section) => section.getBoundingClientRect().top <= 180,
      ) || referenceSections[0];
    for (const link of chapterLinks) {
      if (link.dataset.chapter === current.id)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    const maximum = document.documentElement.scrollHeight - innerHeight;
    document.querySelector("[data-reading-progress]").style.width =
      `${maximum > 0 ? Math.min(100, (scrollY / maximum) * 100) : 0}%`;
  }
  addEventListener(
    "scroll",
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateReading);
      }
    },
    { passive: true },
  );
  addEventListener("resize", updateReading);
  updateReading();
}

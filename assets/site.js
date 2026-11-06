const siteMenu = document.querySelector(".site-menu");

if (siteMenu) {
  const menuToggle = siteMenu.querySelector("summary");

  document.addEventListener("click", (event) => {
    if (siteMenu.open && !siteMenu.contains(event.target)) {
      siteMenu.open = false;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteMenu.open) {
      siteMenu.open = false;
      menuToggle.focus();
    }
  });

  siteMenu.querySelector("nav").addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      siteMenu.open = false;
    }
  });
}

if (document.body.classList.contains("home-page")) {
  const previousSections = {
    research: "research.html",
    publications: "publications.html",
    software: "software.html",
    education: "education.html",
    background: "education.html",
  };
  const destination = previousSections[window.location.hash.slice(1)];

  if (destination) {
    window.location.replace(destination);
  }
}

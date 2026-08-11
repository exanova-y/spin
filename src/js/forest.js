document.addEventListener("DOMContentLoaded", () => {
  const links = new Map(
    [...document.querySelectorAll(".forest-toc a[href^='#']")].map((link) => [
      link.hash.slice(1),
      link
    ])
  );
  const sections = [...document.querySelectorAll(".forest-note")];
  if (!links.size || !sections.length || !("IntersectionObserver" in window)) return;

  let activeId = null;
  const setActive = (id) => {
    if (id === activeId) return;
    if (activeId) links.get(activeId)?.removeAttribute("aria-current");
    links.get(id)?.setAttribute("aria-current", "location");
    activeId = id;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: "-10% 0px -72% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
  setActive(sections[0].id);
});

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll(".profile-frame img, .person-card img").forEach((img) => {
    const showPlaceholder = () => {
      img.style.display = "none";
      img.nextElementSibling.style.display = "grid";
    };
    if (img.complete && img.naturalWidth === 0) showPlaceholder();
    else img.addEventListener("error", showPlaceholder, { once: true });
  });

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const windowBox = carousel.querySelector(".carousel-window");
    const track = carousel.querySelector(".carousel-track");
    const cards = [...track.children];
    const prevButton = carousel.querySelector(".prev");
    const nextButton = carousel.querySelector(".next");
    const dotsBox = carousel.nextElementSibling;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let index = 0;
    let maxIndex = 0;
    let step = 0;
    let autoplay = null;
    let startX = 0;
    let dragging = false;
    let resizeTimer = null;

    function measure() {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = cards[0].offsetWidth + gap;
      const visible = Math.max(1, Math.round((windowBox.clientWidth + gap) / step));
      maxIndex = Math.max(0, cards.length - visible);
    }

    function buildDots() {
      dotsBox.innerHTML = "";
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `${i + 1}-sahifaga o'tish`);
        dot.addEventListener("click", () => {
          goTo(i);
          start();
        });
        dotsBox.appendChild(dot);
      }
    }

    function render() {
      track.style.transform = `translate3d(${-index * step}px, 0, 0)`;
      dotsBox.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-current", String(active));
      });
    }

    function goTo(i) {
      index = i > maxIndex ? 0 : i < 0 ? maxIndex : i;
      render();
    }

    function stop() {
      clearInterval(autoplay);
      autoplay = null;
    }

    function start() {
      stop();
      if (maxIndex === 0 || reduceMotion.matches) return;
      autoplay = setInterval(() => goTo(index + 1), 3500);
    }

    prevButton.addEventListener("click", () => {
      goTo(index - 1);
      start();
    });

    nextButton.addEventListener("click", () => {
      goTo(index + 1);
      start();
    });

    carousel.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") stop();
    });

    carousel.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") start();
    });

    windowBox.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      stop();
    });

    windowBox.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      const distance = e.clientX - startX;
      if (Math.abs(distance) > 45) goTo(index + (distance < 0 ? 1 : -1));
      start();
    });

    windowBox.addEventListener("pointercancel", () => {
      dragging = false;
      start();
    });

    windowBox.addEventListener("dragstart", (e) => e.preventDefault());

    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
      else return;
      start();
    });

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measure();
        index = Math.min(index, maxIndex);
        buildDots();
        render();
        start();
      }, 120);
    });

    measure();
    buildDots();
    render();
    start();
  });
});
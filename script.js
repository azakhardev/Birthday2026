/* =========================================================
   NASTAVENÍ — tady si to snadno upravíš
   ========================================================= */
const CONFIG = {
  // Datum a čas odemčení (český čas, léto = UTC+2)
  unlockDate: "2026-07-09T09:00:00+02:00",
};

/* =========================================================
   ODPOČET + ODEMYKACÍ ANIMACE
   ========================================================= */
(function lockScreenLogic() {
  const unlockTime = new Date(CONFIG.unlockDate).getTime();

  const lockScreen = document.getElementById("lock-screen");
  const mainScreen = document.getElementById("main-screen");
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMins = document.getElementById("cd-mins");
  const elSecs = document.getElementById("cd-secs");

  let timer = null;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function renderCountdown(diffMs) {
    const totalSec = Math.max(0, Math.floor(diffMs / 1000));
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }

  function tick() {
    const now = Date.now();
    const diff = unlockTime - now;
    if (diff <= 0) {
      clearInterval(timer);
      renderCountdown(0);
      startUnlockSequence();
      return;
    }
    renderCountdown(diff);
  }

  function startUnlockSequence(alreadyPastOnLoad) {
    // krok 1: zámeček se odemkne (klapka se otevře), text zmizí
    lockScreen.classList.add("unlocking");

    // krok 2: po chvíli celá obrazovka zmizí
    setTimeout(() => {
      lockScreen.classList.add("fade-out");
    }, 1300);

    // krok 3: skryjeme zámek a ukážeme hlavní obsah
    setTimeout(() => {
      lockScreen.style.display = "none";
      mainScreen.classList.add("active");
      document
        .getElementById("slide-wish")
        .querySelector(".wish-card").style.animationDelay = "0.1s";
    }, 2300);
  }

  // Pokud je stránka navštívena AŽ PO odemčení, animace zámečku
  // se přesto přehraje při každé návštěvě (dle zadání).
  const now = Date.now();
  if (unlockTime - now <= 0) {
    renderCountdown(0);
    setTimeout(() => startUnlockSequence(true), 500);
  } else {
    tick();
    timer = setInterval(tick, 1000);
  }
})();

/* =========================================================
   NAVIGACE MEZI SLIDY (přáníčko ↔ plán dne)
   ========================================================= */
(function slidesLogic() {
  const slides = document.getElementById("slides");
  const nextArrow = document.getElementById("next-arrow");
  const prevArrow = document.getElementById("prev-arrow");
  const dots = document.querySelectorAll(".dot");

  let current = 0; // 0 = přáníčko, 1 = plán dne

  function goTo(index) {
    current = index;
    slides.classList.toggle("show-timeline", current === 1);
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  nextArrow.addEventListener("click", () => goTo(1));
  prevArrow.addEventListener("click", () => goTo(0));
  dots.forEach((dot) => {
    dot.addEventListener("click", () => goTo(Number(dot.dataset.slide)));
  });

  // klávesnice
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(1);
    if (e.key === "ArrowLeft") goTo(0);
  });

  // swipe na dotykových zařízeních
  let touchStartX = null;
  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 60) {
        if (deltaX < 0)
          goTo(1); // posun doleva -> další slide
        else goTo(0); // posun doprava -> zpět
      }
      touchStartX = null;
    },
    { passive: true },
  );
})();

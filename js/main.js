/* =========================================================
   ROBOKRITI 2026 — MAIN JAVASCRIPT
   Interactive robotics competition experience
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------------------------------------
     CONFIG
  ------------------------------------------------------- */

  const CONFIG = {
    registrationDeadline: new Date("2026-09-06T23:59:59+05:30"),

    selectors: {
      body: "body",
      nav: "[data-nav]",
      menuToggle: "[data-menu-toggle]",
      mobileNav: "[data-mobile-nav]",

      countdown: "[data-countdown]",
      registrationStatus: "[data-registration-status]",
      registerButtons: "[data-register]",

      eventItems: "[data-event]",
      eventDrawer: "[data-event-drawer]",
      eventDrawerContent: "[data-event-drawer-content]",
      eventDrawerTitle: "[data-event-drawer-title]",
      eventDrawerNumber: "[data-event-drawer-number]",
      eventDrawerClose: "[data-event-drawer-close]",
      eventDrawerRegister: "[data-event-drawer-register]",

      arenaVisual: "[data-arena-visual]",

      cursorGlow: "[data-cursor-glow]",
      magnetic: "[data-magnetic]",

      reveal: "[data-reveal]"
    }
  };

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const state = {
    registrationOpen: true,
    activeEvent: null,
    menuOpen: false,
    drawerOpen: false,
    reducedMotion: false,
    isMobile: false,
    raf: null,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0
  };

  /* -------------------------------------------------------
     EVENT DATA
     Rules for Robo Soccer intentionally NOT added yet.
  ------------------------------------------------------- */

  const EVENTS = {
    "robo-race": {
      number: "01",
      title: "ROBO RACE",
      shortTitle: "RACE",

      description:
        "A speed-focused robotics challenge where teams compete to navigate the designated race course.",

      rules: [
        "Rules and judging parameters will be displayed from the prepared Robo Race regulations.",
        "Teams must follow the official arena and safety instructions.",
        "Any event-specific restrictions must be followed by all participating teams."
      ],

      accent: "cyan"
    },

    "robo-tug-of-war": {
      number: "02",
      title: "ROBO TUG OF WAR",
      shortTitle: "TUG",

      description:
        "A direct mechanical strength challenge between competing robots.",

      rules: [
        "Rules and judging parameters will be displayed from the prepared Robo Tug of War regulations.",
        "Teams must follow the official arena and safety instructions.",
        "Any event-specific restrictions must be followed by all participating teams."
      ],

      accent: "violet"
    },

    "robo-war": {
      number: "03",
      title: "ROBO WAR",
      shortTitle: "WAR",

      description:
        "A head-to-head robotics battle focused on control, engineering and strategy.",

      rules: [
        "Rules and judging parameters will be displayed from the prepared Robo War regulations.",
        "Teams must follow the official arena and safety instructions.",
        "Any event-specific restrictions must be followed by all participating teams."
      ],

      accent: "cyan"
    },

    "robo-soccer": {
      number: "04",
      title: "ROBO SOCCER",
      shortTitle: "SOCCER",

      description:
        "Robo Soccer is part of ROBOKRITI 2026. Detailed competition rules are currently being prepared.",

      rules: [
        "Detailed Robo Soccer rules are not prepared yet.",
        "Official rules and judging parameters will be published once finalized."
      ],

      accent: "violet",
      rulesPending: true
    }
  };

  /* -------------------------------------------------------
     DOM HELPERS
  ------------------------------------------------------- */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  /* -------------------------------------------------------
     DEVICE / MOTION DETECTION
  ------------------------------------------------------- */

  function updateDeviceState() {
    state.isMobile = window.matchMedia("(max-width: 768px)").matches;

    state.reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* -------------------------------------------------------
     REGISTRATION STATUS
  ------------------------------------------------------- */

  function checkRegistrationStatus() {
    const now = new Date();

    state.registrationOpen =
      now.getTime() < CONFIG.registrationDeadline.getTime();

    document.body.classList.toggle(
      "registration-closed",
      !state.registrationOpen
    );

    updateRegistrationUI();
  }

  function updateRegistrationUI() {
    const buttons = $$(CONFIG.selectors.registerButtons);

    buttons.forEach((button) => {
      if (!state.registrationOpen) {
        button.setAttribute("aria-disabled", "true");
        button.classList.add("is-locked");

        if (button.dataset.originalText === undefined) {
          button.dataset.originalText = button.textContent.trim();
        }

        button.textContent = "LOCKED";
      } else {
        button.removeAttribute("aria-disabled");
        button.classList.remove("is-locked");

        if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
        }
      }
    });

    const status = $(CONFIG.selectors.registrationStatus);

    if (status) {
      status.textContent = state.registrationOpen
        ? "REGISTRATION OPEN"
        : "REGISTRATION CLOSED";

      status.classList.toggle("is-closed", !state.registrationOpen);
    }
  }

  /* -------------------------------------------------------
     COUNTDOWN
  ------------------------------------------------------- */

  function updateCountdown() {
    const countdown = $(CONFIG.selectors.countdown);

    if (!countdown) return;

    if (!state.registrationOpen) {
      countdown.textContent = "STATUS: REGISTRATION CLOSED";
      countdown.classList.add("is-closed");
      return;
    }

    const now = Date.now();
    const target = CONFIG.registrationDeadline.getTime();

    let difference = Math.max(0, target - now);

    const day = Math.floor(difference / 86400000);
    difference %= 86400000;

    const hour = Math.floor(difference / 3600000);
    difference %= 3600000;

    const minute = Math.floor(difference / 60000);
    difference %= 60000;

    const second = Math.floor(difference / 1000);

    const pad = (value) => String(value).padStart(2, "0");

    countdown.textContent =
      `T-MINUS: ${pad(day)} : ${pad(hour)} : ${pad(minute)} : ${pad(second)}`;
  }

  function startCountdown() {
    updateCountdown();

    window.setInterval(updateCountdown, 1000);
  }

  /* -------------------------------------------------------
     MOBILE NAVIGATION
     ------------------------------------------------------- */

  function initMobileNavigation() {
    const toggle = $(CONFIG.selectors.menuToggle);
    const nav = $(CONFIG.selectors.mobileNav);

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      state.menuOpen = !state.menuOpen;

      toggle.setAttribute(
        "aria-expanded",
        String(state.menuOpen)
      );

      nav.classList.toggle("is-open", state.menuOpen);

      document.body.classList.toggle(
        "mobile-menu-open",
        state.menuOpen
      );
    });

    $$("a", nav).forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileNavigation();
      });
    });
  }

  function closeMobileNavigation() {
    const toggle = $(CONFIG.selectors.menuToggle);
    const nav = $(CONFIG.selectors.mobileNav);

    state.menuOpen = false;

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    if (nav) {
      nav.classList.remove("is-open");
    }

    document.body.classList.remove("mobile-menu-open");
  }

  /* -------------------------------------------------------
     EVENT DRAWER
     ------------------------------------------------------- */

  function initEventDrawer() {
    const events = $$(CONFIG.selectors.eventItems);
    const drawer = $(CONFIG.selectors.eventDrawer);

    if (!drawer || !events.length) return;

    events.forEach((eventElement) => {
      eventElement.addEventListener("click", () => {
        const eventId = eventElement.dataset.event;

        if (!eventId || !EVENTS[eventId]) return;

        openEventDrawer(eventId);
      });

      eventElement.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();

        const eventId = eventElement.dataset.event;

        if (eventId && EVENTS[eventId]) {
          openEventDrawer(eventId);
        }
      });
    });

    const closeButton = $(CONFIG.selectors.eventDrawerClose);

    if (closeButton) {
      closeButton.addEventListener("click", closeEventDrawer);
    }

    drawer.addEventListener("click", (event) => {
      if (event.target === drawer) {
        closeEventDrawer();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.drawerOpen) {
        closeEventDrawer();
      }
    });
  }

  function openEventDrawer(eventId) {
    const event = EVENTS[eventId];

    if (!event) return;

    state.activeEvent = eventId;
    state.drawerOpen = true;

    const drawer = $(CONFIG.selectors.eventDrawer);
    const title = $(CONFIG.selectors.eventDrawerTitle);
    const number = $(CONFIG.selectors.eventDrawerNumber);
    const content = $(CONFIG.selectors.eventDrawerContent);
    const register = $(CONFIG.selectors.eventDrawerRegister);

    if (!drawer) return;

    if (title) {
      title.textContent = event.title;
    }

    if (number) {
      number.textContent = event.number;
    }

    if (content) {
      content.innerHTML = buildEventDrawerContent(event);
    }

    if (register) {
      register.dataset.event = eventId;

      if (state.registrationOpen) {
        register.textContent = "INITIATE REGISTRATION";
        register.removeAttribute("aria-disabled");
      } else {
        register.textContent = "LOCKED";
        register.setAttribute("aria-disabled", "true");
      }
    }

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");

    document.body.classList.add("drawer-open");

    if (!state.reducedMotion) {
      requestAnimationFrame(() => {
        drawer.classList.add("is-visible");
      });
    } else {
      drawer.classList.add("is-visible");
    }

    trapDrawerFocus(drawer);
  }

  function buildEventDrawerContent(event) {
    const rulesMarkup = event.rules
      .map((rule) => `<li>${escapeHTML(rule)}</li>`)
      .join("");

    const pendingMarkup = event.rulesPending
      ? `
        <div class="event-pending">
          <span class="event-pending-dot"></span>
          DETAILED RULES PENDING
        </div>
      `
      : "";

    return `
      <p class="drawer-description">
        ${escapeHTML(event.description)}
      </p>

      ${pendingMarkup}

      <div class="drawer-section">
        <span class="drawer-label">RULES</span>

        <ol class="drawer-rules">
          ${rulesMarkup}
        </ol>
      </div>
    `;
  }

  function closeEventDrawer() {
    const drawer = $(CONFIG.selectors.eventDrawer);

    state.drawerOpen = false;
    state.activeEvent = null;

    if (!drawer) return;

    drawer.classList.remove("is-visible");

    window.setTimeout(
      () => {
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
      },
      state.reducedMotion ? 0 : 350
    );

    document.body.classList.remove("drawer-open");
  }

  function trapDrawerFocus(drawer) {
    const focusable = drawer.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    focusable[0].focus();
  }

  /* -------------------------------------------------------
     EVENT VISUAL STATE
     ------------------------------------------------------- */

  function initEventObserver() {
    const events = $$(CONFIG.selectors.eventItems);

    if (!events.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const eventId = entry.target.dataset.event;

          setActiveArena(eventId);
        });
      },
      {
        threshold: 0.55
      }
    );

    events.forEach((event) => observer.observe(event));
  }

  function setActiveArena(eventId) {
    if (!eventId || state.activeEvent === eventId) return;

    const visual = $(CONFIG.selectors.arenaVisual);

    if (!visual) return;

    const event = EVENTS[eventId];

    if (!event) return;

    visual.dataset.activeArena = eventId;

    visual.classList.remove(
      "arena-race",
      "arena-tug",
      "arena-war",
      "arena-soccer"
    );

    const classMap = {
      "robo-race": "arena-race",
      "robo-tug-of-war": "arena-tug",
      "robo-war": "arena-war",
      "robo-soccer": "arena-soccer"
    };

    visual.classList.add(classMap[eventId]);

    state.activeEvent = eventId;
  }

  /* -------------------------------------------------------
     CURSOR ATMOSPHERE
     Desktop only.
     ------------------------------------------------------- */

  function initCursorAtmosphere() {
    if (state.isMobile || state.reducedMotion) return;

    const glow = $(CONFIG.selectors.cursorGlow);

    if (!glow) return;

    window.addEventListener(
      "pointermove",
      (event) => {
        state.targetMouseX = event.clientX;
        state.targetMouseY = event.clientY;
      },
      {
        passive: true
      }
    );

    function animateCursor() {
      state.mouseX +=
        (state.targetMouseX - state.mouseX) * 0.08;

      state.mouseY +=
        (state.targetMouseY - state.mouseY) * 0.08;

      glow.style.transform =
        `translate3d(${state.mouseX}px, ${state.mouseY}px, 0)`;

      state.raf = requestAnimationFrame(animateCursor);
    }

    animateCursor();
  }

  /* -------------------------------------------------------
     MAGNETIC CTA
     ------------------------------------------------------- */

  function initMagneticElements() {
    if (state.isMobile || state.reducedMotion) return;

    const elements = $$(CONFIG.selectors.magnetic);

    elements.forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();

        const x =
          event.clientX -
          (rect.left + rect.width / 2);

        const y =
          event.clientY -
          (rect.top + rect.height / 2);

        const strength = 0.15;

        element.style.transform =
          `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }

  /* -------------------------------------------------------
     REVEAL SYSTEM
     CSS handles the actual transition.
     JS only activates the observer.
     ------------------------------------------------------- */

  function initRevealAnimations() {
    const elements = $$(CONFIG.selectors.reveal);

    if (!elements.length) return;

    if (state.reducedMotion) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element) => observer.observe(element));
  }

  /* -------------------------------------------------------
     REGISTRATION BUTTON PROTECTION
     ------------------------------------------------------- */

  function initRegistrationButtons() {
    const buttons = $$(CONFIG.selectors.registerButtons);

    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        if (!state.registrationOpen) {
          event.preventDefault();
          return;
        }

        const target =
          button.dataset.registrationTarget ||
          button.getAttribute("href");

        if (target && target.startsWith("#")) {
          const element = document.querySelector(target);

          if (element) {
            event.preventDefault();

            element.scrollIntoView({
              behavior: state.reducedMotion
                ? "auto"
                : "smooth"
            });
          }
        }
      });
    });
  }

  /* -------------------------------------------------------
     SMOOTH INTERNAL LINKS
     ------------------------------------------------------- */

  function initSmoothLinks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest(
        'a[href^="#"]'
      );

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: state.reducedMotion
          ? "auto"
          : "smooth",
        block: "start"
      });
    });
  }

  /* -------------------------------------------------------
     VIDEO FALLBACK
     ------------------------------------------------------- */

  function initVideoFallback() {
    const videos = $$("video[data-fallback]");

    videos.forEach((video) => {
      const fallback = video.dataset.fallback;

      video.addEventListener("error", () => {
        video.classList.add("video-failed");

        if (fallback) {
          const container = video.parentElement;

          if (!container) return;

          container.style.backgroundImage =
            `url("${fallback}")`;

          container.classList.add(
            "has-video-fallback"
          );
        }
      });

      video.addEventListener("stalled", () => {
        /*
         * Do not immediately replace the video.
         * Network stalls are temporary.
         */
      });
    });
  }

  /* -------------------------------------------------------
     MOBILE GYROSCOPE
     ------------------------------------------------------- */

  function initGyroscope() {
    if (!state.isMobile || state.reducedMotion) return;

    const visual = $(CONFIG.selectors.arenaVisual);

    if (!visual) return;

    if (!("DeviceOrientationEvent" in window)) return;

    const handleOrientation = (event) => {
      const gamma = Number(event.gamma) || 0;
      const beta = Number(event.beta) || 0;

      const x = Math.max(-15, Math.min(15, gamma));
      const y = Math.max(-15, Math.min(15, beta - 45));

      visual.style.setProperty(
        "--tilt-x",
        `${x}deg`
      );

      visual.style.setProperty(
        "--tilt-y",
        `${y}deg`
      );
    };

    /*
     * iOS requires permission.
     * We only request it from a user gesture.
     */
    if (
      typeof DeviceOrientationEvent.requestPermission ===
      "function"
    ) {
      const button = document.querySelector(
        "[data-enable-motion]"
      );

      if (button) {
        button.addEventListener(
          "click",
          async () => {
            try {
              const permission =
                await DeviceOrientationEvent.requestPermission();

              if (permission === "granted") {
                window.addEventListener(
                  "deviceorientation",
                  handleOrientation,
                  true
                );
              }
            } catch {
              // Motion remains optional.
            }
          }
        );
      }
    } else {
      window.addEventListener(
        "deviceorientation",
        handleOrientation,
        true
      );
    }
  }

  /* -------------------------------------------------------
     RESIZE
     ------------------------------------------------------- */

  function initResizeHandler() {
    let resizeTimer;

    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
          updateDeviceState();
        }, 150);
      },
      {
        passive: true
      }
    );
  }

  /* -------------------------------------------------------
     ESCAPE HTML
     ------------------------------------------------------- */

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* -------------------------------------------------------
     CLEANUP
     ------------------------------------------------------- */

  function cleanup() {
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = null;
    }
  }

  window.addEventListener("pagehide", cleanup);

  /* -------------------------------------------------------
     INITIALIZATION
     ------------------------------------------------------- */

  function init() {
    updateDeviceState();

    checkRegistrationStatus();
    startCountdown();

    initMobileNavigation();
    initEventDrawer();
    initEventObserver();

    initCursorAtmosphere();
    initMagneticElements();

    initRevealAnimations();

    initRegistrationButtons();
    initSmoothLinks();

    initVideoFallback();
    initGyroscope();

    initResizeHandler();

    /*
     * Ensure the initial arena state is correct.
     */
    const firstEvent = $(
      CONFIG.selectors.eventItems
    );

    if (firstEvent) {
      setActiveArena(firstEvent.dataset.event);
    }

    /*
     * Make sure JS-dependent content never starts hidden
     * when JavaScript itself is operating correctly.
     */
    document.documentElement.classList.add(
      "js-ready"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }
})();

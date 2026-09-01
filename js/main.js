/* =========================================================
   ROBOKRITI 2026
   MAIN INTERACTION ENGINE
   ========================================================= */

(() => {
    "use strict";

    /* -----------------------------------------------------
       DOM
    ----------------------------------------------------- */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    /* -----------------------------------------------------
       CONFIG
    ----------------------------------------------------- */

    const CONFIG = {
        registrationDeadline: new Date(
            "2026-09-06T23:59:59+05:30"
        ),

        mobileBreakpoint: 900,

        cursorEase: 0.16,
        parallaxEase: 0.055
    };


    /* -----------------------------------------------------
       STATE
    ----------------------------------------------------- */

    const state = {
        reducedMotion:
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches,

        mouse: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,

            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2
        },

        cursor: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,

            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2
        },

        loaded: false
    };


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    document.documentElement.classList.remove("no-js");

    document.addEventListener("DOMContentLoaded", () => {

        initLoader();
        initHeader();
        initMobileMenu();
        initCountdown();
        initCursor();
        initHeroParallax();
        initEventInteraction();
        initRevealAnimations();
        initHeroVideo();
        initSmoothAnchors();

        startAnimationLoop();

    });


    /* =====================================================
       LOADER
    ===================================================== */

    function initLoader() {

        const loader = $(".page-loader");

        if (!loader) {
            state.loaded = true;
            return;
        }

        const progress = $(".loader-line span", loader);
        const percentage = $(".loader-percentage", loader);

        let value = 0;

        const duration = state.reducedMotion ? 250 : 900;
        const start = performance.now();

        function update(now) {

            const elapsed = now - start;
            const progressValue =
                Math.min(elapsed / duration, 1);

            /*
             * Ease-out curve.
             */
            const eased =
                1 - Math.pow(1 - progressValue, 3);

            value = Math.round(eased * 100);

            if (progress) {
                progress.style.width = `${value}%`;
            }

            if (percentage) {
                percentage.textContent =
                    `${String(value).padStart(3, "0")}%`;
            }

            if (progressValue < 1) {
                requestAnimationFrame(update);
            } else {
                finishLoader();
            }
        }

        requestAnimationFrame(update);


        function finishLoader() {

            /*
             * Give the browser one frame to finish
             * painting the page before removing loader.
             */
            requestAnimationFrame(() => {

                loader.classList.add("loaded");

                state.loaded = true;

                document.body.classList.add("page-ready");

                setTimeout(() => {
                    loader.remove();
                    revealHero();
                }, state.reducedMotion ? 0 : 700);

            });

        }
    }


    /* =====================================================
       HERO INTRO
    ===================================================== */

    function revealHero() {

        const hero = $(".hero");

        if (!hero) return;

        const elements = [
            $(".hero-eyebrow"),
            $(".hero-title"),
            $(".hero-description"),
            $(".hero-actions"),
            $(".hero-footer")
        ].filter(Boolean);

        if (state.reducedMotion) {

            elements.forEach(element => {
                element.style.opacity = "1";
                element.style.transform = "none";
            });

            return;
        }

        elements.forEach((element, index) => {

            element.animate(
                [
                    {
                        opacity: 0,
                        transform: "translateY(35px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)"
                    }
                ],
                {
                    duration: 900,
                    delay: 80 + index * 100,
                    easing: "cubic-bezier(.16,1,.3,1)",
                    fill: "both"
                }
            );

        });
    }


    /* =====================================================
       HEADER
    ===================================================== */

    function initHeader() {

        const header = $(".site-header");

        if (!header) return;

        const update = () => {

            if (window.scrollY > 40) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }

        };

        update();

        window.addEventListener(
            "scroll",
            update,
            { passive: true }
        );
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function initMobileMenu() {

        const button = $(".menu-button");
        const menu = $(".mobile-menu");

        if (!button || !menu) return;

        const links = $$(".mobile-navigation a", menu);

        const toggle = () => {

            const open =
                menu.classList.toggle("open");

            button.classList.toggle(
                "active",
                open
            );

            document.body.classList.toggle(
                "menu-open",
                open
            );

            button.setAttribute(
                "aria-expanded",
                String(open)
            );

        };

        button.addEventListener("click", toggle);

        links.forEach(link => {

            link.addEventListener("click", () => {

                menu.classList.remove("open");
                button.classList.remove("active");

                document.body.classList.remove(
                    "menu-open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {

                    menu.classList.remove("open");
                    button.classList.remove("active");

                    document.body.classList.remove(
                        "menu-open"
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }

            }
        );
    }


    /* =====================================================
       COUNTDOWN
    ===================================================== */

    function initCountdown() {

        const days = $("#days");
        const hours = $("#hours");
        const minutes = $("#minutes");
        const seconds = $("#seconds");

        /*
         * Some versions of the homepage may not include
         * seconds. The countdown still works.
         */
        if (!days && !hours && !minutes && !seconds) {
            return;
        }

        function updateCountdown() {

            const now = new Date();

            let difference =
                CONFIG.registrationDeadline.getTime() -
                now.getTime();

            if (difference <= 0) {

                difference = 0;

                document.documentElement
                    .classList.add(
                        "registration-closed"
                    );
            }

            const totalSeconds =
                Math.floor(difference / 1000);

            const dayValue =
                Math.floor(
                    totalSeconds / 86400
                );

            const hourValue =
                Math.floor(
                    (totalSeconds % 86400) / 3600
                );

            const minuteValue =
                Math.floor(
                    (totalSeconds % 3600) / 60
                );

            const secondValue =
                totalSeconds % 60;

            setText(
                days,
                pad(dayValue)
            );

            setText(
                hours,
                pad(hourValue)
            );

            setText(
                minutes,
                pad(minuteValue)
            );

            setText(
                seconds,
                pad(secondValue)
            );

        }

        updateCountdown();

        setInterval(
            updateCountdown,
            1000
        );
    }


    function setText(element, value) {

        if (element) {
            element.textContent = value;
        }
    }


    function pad(value) {

        return String(value)
            .padStart(2, "0");
    }


    /* =====================================================
       CURSOR
    ===================================================== */

    function initCursor() {

        /*
         * Touch devices do not need a custom cursor.
         */
        if (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0
        ) {
            return;
        }

        const cursor = $(".cursor");
        const ring = $(".cursor-ring");

        if (!cursor || !ring) return;

        document.body.classList.add(
            "custom-cursor-enabled"
        );

        window.addEventListener(
            "mousemove",
            event => {

                state.cursor.targetX =
                    event.clientX;

                state.cursor.targetY =
                    event.clientY;

                state.mouse.targetX =
                    event.clientX;

                state.mouse.targetY =
                    event.clientY;

                cursor.style.opacity = "1";
                ring.style.opacity = "1";

            },
            { passive: true }
        );


        const interactiveElements = $$(
            "a, button, .event-panel, .team-link"
        );

        interactiveElements.forEach(element => {

            element.addEventListener(
                "mouseenter",
                () => {
                    document.body.classList.add(
                        "cursor-active"
                    );
                }
            );

            element.addEventListener(
                "mouseleave",
                () => {
                    document.body.classList.remove(
                        "cursor-active"
                    );
                }
            );

        });
    }


    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    function initHeroParallax() {

        const hero = $(".hero");

        if (!hero || state.reducedMotion) {
            return;
        }

        /*
         * Mouse movement is deliberately subtle.
         * The effect should make the hero feel alive,
         * not like a game menu.
         */
        hero.addEventListener(
            "mousemove",
            event => {

                const rect =
                    hero.getBoundingClientRect();

                const x =
                    (event.clientX - rect.left) /
                    rect.width;

                const y =
                    (event.clientY - rect.top) /
                    rect.height;

                state.mouse.targetX =
                    (x - .5) * 2;

                state.mouse.targetY =
                    (y - .5) * 2;

            },
            { passive: true }
        );

        hero.addEventListener(
            "mouseleave",
            () => {

                state.mouse.targetX = 0;
                state.mouse.targetY = 0;

            }
        );
    }


    /* =====================================================
       EVENT INTERACTION
    ===================================================== */

    function initEventInteraction() {

        const panels =
            $$(".event-panel");

        if (!panels.length) return;

        panels.forEach(panel => {

            if (
                state.reducedMotion ||
                "ontouchstart" in window
            ) {
                return;
            }

            panel.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        panel.getBoundingClientRect();

                    const x =
                        event.clientX - rect.left;

                    const y =
                        event.clientY - rect.top;

                    const offsetX =
                        ((x / rect.width) - .5) * 14;

                    const offsetY =
                        ((y / rect.height) - .5) * 10;

                    panel.style.setProperty(
                        "--mouse-x",
                        `${offsetX}px`
                    );

                    panel.style.setProperty(
                        "--mouse-y",
                        `${offsetY}px`
                    );

                },
                { passive: true }
            );

            panel.addEventListener(
                "mouseleave",
                () => {

                    panel.style.setProperty(
                        "--mouse-x",
                        "0px"
                    );

                    panel.style.setProperty(
                        "--mouse-y",
                        "0px"
                    );

                }
            );
        });
    }


    /* =====================================================
       SCROLL REVEALS
    ===================================================== */

    function initRevealAnimations() {

        const elements = $$(
            "[data-reveal], .reveal"
        );

        if (!elements.length) return;

        if (
            state.reducedMotion ||
            !("IntersectionObserver" in window)
        ) {

            elements.forEach(element => {
                element.classList.add("revealed");
            });

            return;
        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "revealed"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: .12,
                    rootMargin: "0px 0px -8% 0px"
                }
            );


        elements.forEach(element => {
            observer.observe(element);
        });
    }


    /* =====================================================
       HERO VIDEO
    ===================================================== */

    function initHeroVideo() {

        const video = $(".hero-video");

        if (!video) return;

        /*
         * Mobile devices sometimes delay autoplay.
         * These attributes help Safari/Chrome treat
         * the video as background media.
         */
        video.muted = true;
        video.playsInline = true;

        const playVideo = () => {

            if (state.reducedMotion) {
                return;
            }

            const promise =
                video.play();

            if (
                promise &&
                typeof promise.catch === "function"
            ) {
                promise.catch(() => {
                    /*
                     * Autoplay can be blocked.
                     * The static visual layers remain usable.
                     */
                });
            }
        };

        if (video.readyState >= 2) {
            playVideo();
        } else {

            video.addEventListener(
                "canplay",
                playVideo,
                { once: true }
            );

        }

        /*
         * Pause when the hero is no longer visible.
         * This saves battery and processing.
         */
        if (
            "IntersectionObserver" in window
        ) {

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(entry => {

                            if (entry.isIntersecting) {
                                playVideo();
                            } else {
                                video.pause();
                            }

                        });

                    },
                    {
                        threshold: 0.05
                    }
                );

            observer.observe(video);
        }
    }


    /* =====================================================
       SMOOTH ANCHOR NAVIGATION
    ===================================================== */

    function initSmoothAnchors() {

        const anchors =
            $$('a[href^="#"]');

        anchors.forEach(anchor => {

            anchor.addEventListener(
                "click",
                event => {

                    const id =
                        anchor
                            .getAttribute("href");

                    if (
                        !id ||
                        id === "#"
                    ) {
                        return;
                    }

                    const target =
                        $(id);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    const header =
                        $(".site-header");

                    const offset =
                        header
                            ? header.offsetHeight
                            : 0;

                    const top =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        offset -
                        10;

                    window.scrollTo({
                        top,
                        behavior:
                            state.reducedMotion
                                ? "auto"
                                : "smooth"
                    });

                }
            );

        });
    }


    /* =====================================================
       ANIMATION LOOP
    ===================================================== */

    function startAnimationLoop() {

        const cursor =
            $(".cursor");

        const ring =
            $(".cursor-ring");

        const heroVideo =
            $(".hero-video");

        const hero =
            $(".hero");

        function frame() {

            /*
             * Cursor interpolation.
             */
            if (
                cursor &&
                ring &&
                !state.reducedMotion
            ) {

                state.cursor.x +=
                    (
                        state.cursor.targetX -
                        state.cursor.x
                    ) *
                    CONFIG.cursorEase;

                state.cursor.y +=
                    (
                        state.cursor.targetY -
                        state.cursor.y
                    ) *
                    CONFIG.cursorEase;

                cursor.style.transform =
                    `translate3d(
                        ${state.cursor.x}px,
                        ${state.cursor.y}px,
                        0
                    )`;

                ring.style.transform =
                    `translate3d(
                        ${state.cursor.x}px,
                        ${state.cursor.y}px,
                        0
                    )`;
            }


            /*
             * Hero video breathing/parallax.
             */
            if (
                heroVideo &&
                hero &&
                !state.reducedMotion &&
                window.innerWidth > CONFIG.mobileBreakpoint
            ) {

                const targetX =
                    state.mouse.targetX;

                const targetY =
                    state.mouse.targetY;

                state.mouse.x +=
                    (
                        targetX -
                        state.mouse.x
                    ) *
                    CONFIG.parallaxEase;

                state.mouse.y +=
                    (
                        targetY -
                        state.mouse.y
                    ) *
                    CONFIG.parallaxEase;

                const translateX =
                    state.mouse.x * -7;

                const translateY =
                    state.mouse.y * -5;

                heroVideo.style.transform =
                    `scale(1.035)
                     translate3d(
                        ${translateX}px,
                        ${translateY}px,
                        0
                     )`;
            }


            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }


    /* =====================================================
       RESIZE
    ===================================================== */

    let resizeTimer;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(
                () => {

                    /*
                     * Return hero video to a safe state
                     * after major viewport changes.
                     */
                    const video =
                        $(".hero-video");

                    if (
                        video &&
                        window.innerWidth <=
                        CONFIG.mobileBreakpoint
                    ) {

                        video.style.transform =
                            "scale(1.025)";
                    }

                },
                120
            );

        },
        { passive: true }
    );


    /* =====================================================
       PAGE VISIBILITY
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            const video =
                $(".hero-video");

            if (!video) return;

            if (document.hidden) {
                video.pause();
            } else if (
                !state.reducedMotion
            ) {
                video.play().catch(() => {});
            }

        }
    );

})();

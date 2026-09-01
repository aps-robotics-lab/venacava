/* =========================================================
   ROBOKRITI 2026
   MAIN JAVASCRIPT
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       HELPERS
       ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const nav = $("#site-nav");
    const menuToggle = $("#menu-toggle");
    const mobileMenu = $("#mobile-menu");

    const closeMobileMenu = () => {
        if (!menuToggle || !mobileMenu) return;

        menuToggle.classList.remove("active");
        mobileMenu.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");

        document.body.classList.remove("menu-open");
    };

    const openMobileMenu = () => {
        if (!menuToggle || !mobileMenu) return;

        menuToggle.classList.add("active");
        mobileMenu.classList.add("open");

        menuToggle.setAttribute("aria-expanded", "true");
        mobileMenu.setAttribute("aria-hidden", "false");

        document.body.classList.add("menu-open");
    };

    if (menuToggle && mobileMenu) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.contains("open");

            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }

        });

        $$(".mobile-menu-link", mobileMenu).forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });

    }


    /* =====================================================
       NAVIGATION SCROLL STATE
       ===================================================== */

    const updateNav = () => {

        if (!nav) return;

        if (window.scrollY > 40) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }

    };

    updateNav();

    window.addEventListener(
        "scroll",
        updateNav,
        { passive: true }
    );


    /* =====================================================
       COUNTDOWN
       ===================================================== */

    const countdown = $("#countdown");

    const countdownDays = $("#countdown-days");
    const countdownHours = $("#countdown-hours");
    const countdownMinutes = $("#countdown-minutes");

    const registrationDeadline =
        countdown?.dataset.deadline ||
        "2026-09-06T23:59:59+05:30";

    const deadline = new Date(registrationDeadline);

    const pad = value =>
        String(Math.max(0, value)).padStart(2, "0");

    const updateCountdown = () => {

        if (!countdown) return;

        const now = new Date();
        const difference =
            deadline.getTime() - now.getTime();

        if (difference <= 0) {

            if (countdownDays) countdownDays.textContent = "00";
            if (countdownHours) countdownHours.textContent = "00";
            if (countdownMinutes) countdownMinutes.textContent = "00";

            countdown.classList.add("expired");

            return;
        }

        const totalMinutes =
            Math.floor(difference / 60000);

        const days =
            Math.floor(totalMinutes / 1440);

        const hours =
            Math.floor((totalMinutes % 1440) / 60);

        const minutes =
            totalMinutes % 60;

        if (countdownDays) {
            countdownDays.textContent = pad(days);
        }

        if (countdownHours) {
            countdownHours.textContent = pad(hours);
        }

        if (countdownMinutes) {
            countdownMinutes.textContent = pad(minutes);
        }

    };

    updateCountdown();

    setInterval(updateCountdown, 1000);


    /* =====================================================
       SCROLL REVEALS
       ===================================================== */

    const revealElements = $$("[data-reveal]");

    if (
        !prefersReducedMotion &&
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) return;

                        entry.target.classList.add("revealed");

                        revealObserver.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -8% 0px"
                }
            );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("revealed");
        });

    }


    /* =====================================================
       MAGNETIC BUTTONS
       ===================================================== */

    const magneticElements = $$(".magnetic");

    if (
        !prefersReducedMotion &&
        window.matchMedia("(pointer: fine)").matches
    ) {

        magneticElements.forEach(element => {

            element.addEventListener("pointermove", event => {

                const rect =
                    element.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left -
                    rect.width / 2;

                const y =
                    event.clientY -
                    rect.top -
                    rect.height / 2;

                const strength = 0.18;

                element.style.transform =
                    `translate(${x * strength}px, ${y * strength}px)`;

            });

            element.addEventListener("pointerleave", () => {

                element.style.transform = "";

            });

        });

    }


    /* =====================================================
       EVENT HOVER MOTION
       ===================================================== */

    if (
        !prefersReducedMotion &&
        window.matchMedia("(pointer: fine)").matches
    ) {

        $$(".event-item").forEach(item => {

            item.addEventListener("pointermove", event => {

                const rect =
                    item.getBoundingClientRect();

                const relativeX =
                    (event.clientX - rect.left) /
                    rect.width;

                const relativeY =
                    (event.clientY - rect.top) /
                    rect.height;

                const moveX =
                    (relativeX - 0.5) * 8;

                const moveY =
                    (relativeY - 0.5) * 4;

                item.style.setProperty(
                    "--mouse-x",
                    `${moveX}px`
                );

                item.style.setProperty(
                    "--mouse-y",
                    `${moveY}px`
                );

            });

            item.addEventListener("pointerleave", () => {

                item.style.setProperty(
                    "--mouse-x",
                    "0px"
                );

                item.style.setProperty(
                    "--mouse-y",
                    "0px"
                );

            });

        });

    }


    /* =====================================================
       HERO POINTER STATE
       ===================================================== */

    const hero = $("#hero");

    let pointerX = 0;
    let pointerY = 0;

    let targetPointerX = 0;
    let targetPointerY = 0;

    if (
        hero &&
        !prefersReducedMotion &&
        window.matchMedia("(pointer: fine)").matches
    ) {

        hero.addEventListener(
            "pointermove",
            event => {

                const rect =
                    hero.getBoundingClientRect();

                targetPointerX =
                    ((event.clientX - rect.left) /
                        rect.width -
                        0.5);

                targetPointerY =
                    ((event.clientY - rect.top) /
                        rect.height -
                        0.5);

            },
            { passive: true }
        );

        hero.addEventListener(
            "pointerleave",
            () => {
                targetPointerX = 0;
                targetPointerY = 0;
            }
        );

    }


    /* =====================================================
       HERO VISUAL MOTION
       ===================================================== */

    const heroVisual = $(".hero-visual");
    const heroOrbit = $(".hero-orbit");

    const animateHeroMotion = () => {

        pointerX +=
            (targetPointerX - pointerX) * 0.045;

        pointerY +=
            (targetPointerY - pointerY) * 0.045;

        if (heroVisual) {

            heroVisual.style.transform =
                `translate3d(
                    ${pointerX * -12}px,
                    ${pointerY * -8}px,
                    0
                )`;

        }

        if (heroOrbit) {

            heroOrbit.style.transform =
                `translate3d(
                    ${pointerX * 18}px,
                    calc(-50% + ${pointerY * 12}px),
                    0
                )`;

        }

        if (!prefersReducedMotion) {
            requestAnimationFrame(animateHeroMotion);
        }

    };

    if (!prefersReducedMotion) {
        requestAnimationFrame(animateHeroMotion);
    }


    /* =====================================================
       THREE.JS HERO FIELD
       ===================================================== */

    const canvas = $("#hero-canvas");

    if (
        canvas &&
        typeof THREE !== "undefined" &&
        !prefersReducedMotion
    ) {

        const renderer =
            new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 1.75)
        );

        renderer.setClearColor(0x000000, 0);


        const scene = new THREE.Scene();

        const camera =
            new THREE.PerspectiveCamera(
                42,
                1,
                0.1,
                100
            );

        camera.position.set(
            0,
            0,
            7
        );


        /* -------------------------------------------------
           CENTRAL ROBOTIC CORE
           ------------------------------------------------- */

        const coreGroup =
            new THREE.Group();

        scene.add(coreGroup);


        const coreGeometry =
            new THREE.IcosahedronGeometry(
                1.05,
                2
            );

        const coreMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x62e6ff,
                wireframe: true,
                transparent: true,
                opacity: 0.23
            });

        const core =
            new THREE.Mesh(
                coreGeometry,
                coreMaterial
            );

        coreGroup.add(core);


        /* -------------------------------------------------
           INNER CORE
           ------------------------------------------------- */

        const innerGeometry =
            new THREE.IcosahedronGeometry(
                0.62,
                1
            );

        const innerMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x8b7cff,
                wireframe: true,
                transparent: true,
                opacity: 0.16
            });

        const inner =
            new THREE.Mesh(
                innerGeometry,
                innerMaterial
            );

        coreGroup.add(inner);


        /* -------------------------------------------------
           ORBIT RINGS
           ------------------------------------------------- */

        const createRing = (
            radius,
            rotation,
            opacity
        ) => {

            const geometry =
                new THREE.TorusGeometry(
                    radius,
                    0.006,
                    8,
                    128
                );

            const material =
                new THREE.MeshBasicMaterial({
                    color: 0x62e6ff,
                    transparent: true,
                    opacity
                });

            const ring =
                new THREE.Mesh(
                    geometry,
                    material
                );

            ring.rotation.set(
                rotation.x,
                rotation.y,
                rotation.z
            );

            coreGroup.add(ring);

            return ring;
        };


        const ringOne =
            createRing(
                1.45,
                {
                    x: 0.6,
                    y: 0.2,
                    z: 0.15
                },
                0.35
            );

        const ringTwo =
            createRing(
                1.72,
                {
                    x: 1.4,
                    y: -0.5,
                    z: 0.3
                },
                0.16
            );

        const ringThree =
            createRing(
                2.05,
                {
                    x: -0.5,
                    y: 0.9,
                    z: -0.2
                },
                0.09
            );


        /* -------------------------------------------------
           PARTICLE FIELD
           ------------------------------------------------- */

        const particleCount = 700;

        const particlePositions =
            new Float32Array(
                particleCount * 3
            );

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {

            const i3 = i * 3;

            const radius =
                2.5 +
                Math.random() * 5;

            const angle =
                Math.random() *
                Math.PI *
                2;

            const vertical =
                (Math.random() - 0.5) *
                5;

            particlePositions[i3] =
                Math.cos(angle) *
                radius;

            particlePositions[i3 + 1] =
                vertical;

            particlePositions[i3 + 2] =
                Math.sin(angle) *
                radius;

        }


        const particleGeometry =
            new THREE.BufferGeometry();

        particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                particlePositions,
                3
            )
        );


        const particleMaterial =
            new THREE.PointsMaterial({
                color: 0x62e6ff,
                size: 0.018,
                transparent: true,
                opacity: 0.42,
                sizeAttenuation: true
            });


        const particles =
            new THREE.Points(
                particleGeometry,
                particleMaterial
            );

        scene.add(particles);


        /* -------------------------------------------------
           RESIZE
           ------------------------------------------------- */

        const resize = () => {

            const width =
                canvas.clientWidth ||
                canvas.parentElement.clientWidth;

            const height =
                canvas.clientHeight ||
                canvas.parentElement.clientHeight;

            if (!width || !height) return;

            renderer.setSize(
                width,
                height,
                false
            );

            camera.aspect =
                width / height;

            camera.updateProjectionMatrix();

        };

        resize();

        window.addEventListener(
            "resize",
            resize,
            { passive: true }
        );


        /* -------------------------------------------------
           ANIMATION
           ------------------------------------------------- */

        let elapsed = 0;

        const render = () => {

            elapsed += 0.006;


            core.rotation.x =
                elapsed * 0.23;

            core.rotation.y =
                elapsed * 0.31;


            inner.rotation.x =
                -elapsed * 0.35;

            inner.rotation.y =
                elapsed * 0.48;


            ringOne.rotation.z =
                elapsed * 0.42;

            ringTwo.rotation.x =
                elapsed * 0.27;

            ringThree.rotation.y =
                -elapsed * 0.19;


            particles.rotation.y =
                elapsed * 0.025;


            const targetRotationX =
                targetPointerY * 0.12;

            const targetRotationY =
                targetPointerX * 0.16;

            coreGroup.rotation.x +=
                (targetRotationX -
                    coreGroup.rotation.x) *
                0.025;

            coreGroup.rotation.y +=
                (targetRotationY -
                    coreGroup.rotation.y) *
                0.025;


            renderer.render(
                scene,
                camera
            );

            requestAnimationFrame(render);

        };

        render();

    }


    /* =====================================================
       SMOOTH INTERNAL ANCHOR LINKS
       ===================================================== */

    $$('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                $(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior:
                    prefersReducedMotion
                        ? "auto"
                        : "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       KEYBOARD ACCESSIBILITY
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeMobileMenu();
            }

        }
    );


    /* =====================================================
       PAGE READY
       ===================================================== */

    document.documentElement.classList.add(
        "js-ready"
    );

})();

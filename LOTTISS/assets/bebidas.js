/* ============================================================
   EducaJuega · bebidas.js  (Nivel 1 · Conecta y elige)
   Requiere comun.js
   ============================================================ */
(function () {
    "use strict";
    const { $, $$, hit, sfx, speakPrompt, setFeedback, finish } = window.EJ;

    const rounds = [
        { when: "Después de estudiar", opts: [["🥤", "Refresco"], ["💧", "Agua"], ["⚡", "Bebida energética"]], ok: 1,
          good: "¡Muy bien! El agua ayuda a tu cuerpo a mantenerse hidratado.",
          image: "img/Jake y Lily.pdf (1).png", imageAlt: "Jake listo para elegir una bebida" },
        { when: "En el desayuno", opts: [["🥛", "Leche"], ["🥤", "Refresco"], ["⚡", "Bebida energética"]], ok: 0,
          good: "¡Excelente! La leche te da fuerza para empezar el día.",
          image: "img/Jake y Lily.pdf (2).png", imageAlt: "Lily con su ropa de estrellas" },
        { when: "Cuando tienes mucha sed", opts: [["⚡", "Bebida energética"], ["🥤", "Refresco"], ["💧", "Agua"]], ok: 2,
          good: "¡Perfecto! El agua quita la sed.",
          image: "img/Jake y Lily.pdf.png", imageAlt: "Jake con ropa de explorador" },
    ];

    let i, stars, tries, locked;
    const fb = $("#drink-feedback");
    const box = $("#drink-choices");
    const heroImage = $(".drink-hero img");

    function render() {
        const r = rounds[i];
        $("#drink-when").textContent = r.when;
        heroImage.src = r.image;
        heroImage.alt = r.imageAlt;
        speakPrompt($("#drink-game-title"), $("#drink-when"));
        box.innerHTML = r.opts.map((o, n) =>
            `<button class="choice-card" type="button" data-n="${n}"><span class="dot"></span>
                <span class="choice-emoji" aria-hidden="true">${o[0]}</span>
                <span><small>OPCIÓN ${n + 1}</small><strong>${o[1]}</strong></span></button>`
        ).join("");
        $$(".choice-card", box).forEach((b) => b.addEventListener("click", () => choose(+b.dataset.n)));
        tries = 0;
        locked = false;
        setFeedback(fb, "Arrastra la línea o toca una bebida.", "");
    }

    function choose(n) {
        if (locked) return;
        const r = rounds[i];
        const card = $$(".choice-card", box)[n];

        if (n === r.ok) {
            locked = true;
            card.classList.add("correct");
            if (tries === 0) stars++;
            sfx.ok();
            setFeedback(fb, r.good, "success");
            setTimeout(() => {
                i++;
                if (i >= rounds.length) {
                    finish("drink", Math.max(1, stars), "¡Eliges bebidas saludables!", start);
                } else {
                    render();
                }
            }, 1400);
        } else {
            tries++;
            card.classList.remove("incorrect");
            void card.offsetWidth;
            card.classList.add("incorrect");
            sfx.no();
            setFeedback(fb, "Inténtalo otra vez. ¡Tú puedes!", "try-again");
        }
    }

    /* ---------- línea que se arrastra desde Lily hasta la bebida ---------- */
    const handle = $("#drink-handle");
    const board = $("#drink-board");
    const line = $("#drink-line-el");
    let dragging = false;

    handle.addEventListener("pointerdown", (e) => {
        if (locked) return;
        dragging = true;
        handle.setPointerCapture(e.pointerId);
        const b = board.getBoundingClientRect();
        const h = handle.getBoundingClientRect();
        line.setAttribute("x1", h.left + h.width / 2 - b.left);
        line.setAttribute("y1", h.top + h.height / 2 - b.top);
        line.setAttribute("x2", e.clientX - b.left);
        line.setAttribute("y2", e.clientY - b.top);
        line.setAttribute("visibility", "visible");
    });

    function cardAt(e) {
        return document.elementsFromPoint(e.clientX, e.clientY)
            .find((el) => el.classList && el.classList.contains("choice-card"));
    }

    handle.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const b = board.getBoundingClientRect();
        line.setAttribute("x2", e.clientX - b.left);
        line.setAttribute("y2", e.clientY - b.top);
        const over = cardAt(e);
        $$(".choice-card", box).forEach((c) => c.classList.toggle("hover-drop", c === over));
    });

    function endDrag(e, cancel) {
        if (!dragging) return;
        dragging = false;
        line.setAttribute("visibility", "hidden");
        $$(".choice-card", box).forEach((c) => c.classList.remove("hover-drop"));
        if (cancel) return;
        const target = cardAt(e);
        if (target) choose(+target.dataset.n);
    }

    handle.addEventListener("pointerup", (e) => endDrag(e, false));
    handle.addEventListener("pointercancel", (e) => endDrag(e, true));
    handle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            $$(".choice-card", box)[0].focus();
        }
    });

    function start() {
        i = 0;
        stars = 0;
        render();
    }

    start();
})();

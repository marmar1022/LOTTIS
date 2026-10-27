/* ============================================================
   EducaJuega · comun.js
   Funciones compartidas por los tres juegos.
   Se expone como window.EJ
   ============================================================ */
(function () {
    "use strict";

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];

    /* ---------- Progreso (estrellas) ----------
       Usa la misma clave que educajuega.html, así los logros coinciden. */
    const KEY = "educajuega-progreso";
    const progress = { drink: 0, clothes: 0, food: 0 };
    try { Object.assign(progress, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}

    function saveProgress() {
        try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (e) {}
    }

    const starsText = (n) => "⭐".repeat(n);

    /* ---------- Sonidos ---------- */
    let audio;
    function tone(freqs, dur = 0.14) {
        try {
            audio = audio || new (window.AudioContext || window.webkitAudioContext)();
            freqs.forEach((f, i) => {
                const o = audio.createOscillator();
                const g = audio.createGain();
                o.type = "sine";
                o.frequency.value = f;
                const t = audio.currentTime + i * dur;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                o.connect(g);
                g.connect(audio.destination);
                o.start(t);
                o.stop(t + dur + 0.02);
            });
        } catch (e) {}
    }

    const sfx = {
        ok: () => tone([523, 659, 784]),
        no: () => tone([300, 240], 0.16),
        win: () => tone([523, 659, 784, 1047], 0.16),
    };

    /* ---------- Voz (lee la instrucción en voz alta) ---------- */
    function speak(text) {
        if (!("speechSynthesis" in window)) return;
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "es-MX";
        u.rate = 0.9;
        u.pitch = 1.15;
        speechSynthesis.speak(u);
    }

    function speakPrompt(title, instruction) {
        speak(title.textContent + ". " + instruction.textContent);
    }

    $$("[data-speak]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const panel = btn.closest(".play-panel");
            speakPrompt($("h1", panel), btn.parentElement.querySelector("span"));
        });
    });

    window.addEventListener("pagehide", () => {
        if ("speechSynthesis" in window) speechSynthesis.cancel();
    });

    /* ---------- Utilidades ---------- */
    function setFeedback(el, msg, kind) {
        el.textContent = msg;
        el.className = "game-feedback" + (kind ? " " + kind : "");
    }

    function shake(el) {
        el.classList.remove("wrong");
        void el.offsetWidth;
        el.classList.add("wrong");
        setTimeout(() => el.classList.remove("wrong"), 450);
    }

    function confetti() {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const set = ["⭐", "✨", "🎈", "🍎", "💧", "🎉"];
        for (let i = 0; i < 26; i++) {
            const s = document.createElement("span");
            s.className = "confetti";
            s.textContent = set[i % set.length];
            s.style.left = Math.random() * 100 + "vw";
            s.style.animationDuration = 2 + Math.random() * 2 + "s";
            s.style.animationDelay = Math.random() * 0.6 + "s";
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 4800);
        }
    }

    /* ---------- Arrastrar con puntero (funciona en táctil) ---------- */
    function hit(target, e) {
        const r = target.getBoundingClientRect();
        const p = 24;
        return e.clientX >= r.left - p && e.clientX <= r.right + p &&
               e.clientY >= r.top - p && e.clientY <= r.bottom + p;
    }

    /* opts: { target: () => elemento destino, onDrop(el), onTap(el) } */
    function draggable(el, opts) {
        let sx, sy, ghost = null, moved = false, pid = null;

        el.addEventListener("pointerdown", (e) => {
            if (el.disabled || e.button > 0) return;
            sx = e.clientX; sy = e.clientY; moved = false; pid = e.pointerId;
            try { el.setPointerCapture(pid); } catch (_) {}
        });

        el.addEventListener("pointermove", (e) => {
            if (pid !== e.pointerId) return;
            if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
                moved = true;
                const r = el.getBoundingClientRect();
                ghost = el.cloneNode(true);
                ghost.classList.add("drag-ghost");
                ghost.style.width = r.width + "px";
                ghost.style.height = r.height + "px";
                document.body.appendChild(ghost);
                el.classList.add("dragging");
            }
            if (ghost) {
                ghost.style.left = e.clientX - ghost.offsetWidth / 2 + "px";
                ghost.style.top = e.clientY - ghost.offsetHeight / 2 + "px";
                const t = opts.target();
                t.classList.toggle("drag-over", hit(t, e));
            }
        });

        const end = (e, cancel) => {
            if (pid !== e.pointerId) return;
            pid = null;
            if (ghost) {
                ghost.remove();
                ghost = null;
                el.classList.remove("dragging");
                const t = opts.target();
                t.classList.remove("drag-over");
                if (!cancel && hit(t, e)) opts.onDrop(el);
            } else if (!cancel) {
                opts.onTap(el);
            }
        };

        el.addEventListener("pointerup", (e) => end(e, false));
        el.addEventListener("pointercancel", (e) => end(e, true));
        /* teclado: Enter / Espacio disparan click con detail === 0 */
        el.addEventListener("click", (e) => { if (e.detail === 0) opts.onTap(el); });
    }

    /* ---------- Premio final ---------- */
    let replay = null;
    const win = $("#win");

    function finish(key, stars, text, again) {
        replay = again || null;
        progress[key] = Math.max(progress[key] || 0, stars);
        saveProgress();
        $("#win-stars").textContent = starsText(stars);
        $("#win-text").textContent = text;
        win.hidden = false;
        $("#win-again").focus();
        sfx.win();
        confetti();
        speak("¡Lo lograste! ¡Muy bien!");
    }

    $("#win-again").addEventListener("click", () => {
        win.hidden = true;
        if (replay) replay();
    });

    window.EJ = { $, $$, progress, starsText, sfx, speak, speakPrompt, setFeedback, shake, confetti, hit, draggable, finish };
})();

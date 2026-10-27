/* ============================================================
   EducaJuega · comida.js  (Nivel 3 · Elige mejor)
   Requiere comun.js
   ============================================================ */
(function () {
    "use strict";
    const { $, $$, sfx, speakPrompt, setFeedback, shake, draggable, finish } = window.EJ;

    /* [emoji, nombre, es fruta (1) o dulce (0)] — mismos 8 alimentos del Canva */
    const items = [
        ["🍎", "Manzana", 1], ["🍬", "Caramelo", 0], ["🍌", "Plátano", 1], ["🍭", "Paleta", 0],
        ["🍓", "Fresa", 1], ["🍪", "Galleta", 0], ["🍊", "Naranja", 1], ["🧁", "Pudín", 0],
    ];
    const goal = 4;

    const plate = $("#fruit-plate");
    const fruits = $("#plate-fruits");
    const count = $("#fruit-count");
    const fb = $("#food-feedback");
    let got, mistakes;

    function start() {
        $("#food-options").innerHTML = items.map((o) =>
            `<button class="food-option" type="button" data-food="${o[1]}" data-fruit="${o[2]}" data-emoji="${o[0]}" aria-label="${o[1]}">
                <span aria-hidden="true">${o[0]}</span><strong>${o[1]}</strong></button>`
        ).join("");

        $$(".food-option").forEach((b) =>
            draggable(b, { target: () => plate, onDrop: add, onTap: add })
        );

        fruits.textContent = "";
        count.textContent = "0";
        got = 0;
        mistakes = 0;
        setFeedback(fb, "Busca 4 frutas saludables.", "");
        speakPrompt($("#food-game-title"), $(".play-instructions span"));
    }

    function add(btn) {
        if (btn.disabled) return;

        if (btn.dataset.fruit !== "1") {
            mistakes++;
            shake(btn);
            sfx.no();
            setFeedback(fb, btn.dataset.food + " es un dulce. ¡Busca una fruta!", "try-again");
            return;
        }

        btn.disabled = true;
        btn.classList.add("added");
        const s = document.createElement("span");
        s.textContent = btn.dataset.emoji;
        fruits.appendChild(s);
        got++;
        count.textContent = String(got);
        sfx.ok();

        if (got >= goal) {
            setFeedback(fb, "¡Excelente! Llenaste el plato con frutas saludables.", "success");
            const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
            setTimeout(() => finish("food", stars, "¡Eres un chef de frutas!", start), 900);
        } else {
            setFeedback(fb, "¡Buena elección! Sigue buscando frutas.", "success");
        }
    }

    start();
})();

/* ============================================================
   EducaJuega · ropa.js  (Nivel 2 · Ayúdame a vestirme)
   Requiere comun.js
   ============================================================ */
(function () {
    "use strict";
    const { $, $$, sfx, speakPrompt, setFeedback, shake, draggable, finish } = window.EJ;

    const characters = {
        lily: {
            name: "Lily",
            baseImage: "img/Copia de Lily.pdf (1).png",
            outfits: [
                ["img/Lily.pdf (4).png", "Uniforme escolar"],
                ["img/Lily.pdf (1).png", "Ropa para hacer ejercicio"],
                ["img/Lily.pdf.png", "Pijama para dormir"],
            ],
            dressedImages: ["img/Lily.pdf (3).png", "img/Lily.pdf (5).png", "img/Lily.pdf (2).png"],
        },
        jake: {
            name: "Jake",
            baseImage: "img/jake-base.png",
            outfits: [
                ["img/jake y lily.pdf (9).png", "Uniforme escolar"],
                ["img/jake y lily.pdf (11).png", "Ropa para hacer ejercicio"],
                ["img/jake y lily.pdf (10).png", "Pijama para dormir"],
            ],
            dressedImages: ["img/Jake esco.png", "img/jake-ejercicio.png", "img/jake-pijama.png"],
        },
    };

    const rounds = [
        { when: "Es hora de ir a la escuela", occasion: "🏫", cls: "occasion-school", ok: "Uniforme escolar" },
        { when: "¡Vamos a hacer ejercicio!", occasion: "⚽", cls: "occasion-exercise", ok: "Ropa para hacer ejercicio" },
        { when: "Es hora de dormir", occasion: "🌙", cls: "occasion-sleep", ok: "Pijama para dormir" },
    ];

    let i = 0, stars = 0, tries = 0, locked = false, activeCharacter = "", roundAdvanceTimeout = null;
    const characterSelect = $("#character-select");
    const gameScreen = $("#dress-game-screen");
    const characterChoices = $$("[data-dress-character]");
    const scene = $("#dress-scene");
    const fb = $("#clothes-feedback");
    const characterImage = $("#dress-character-image");
    const gameTitle = $("#clothes-game-title");

    function getRound() {
        const character = characters[activeCharacter];
        const round = rounds[i];
        return {
            ...round,
            dressedImage: character.dressedImages[i],
            dressedAlt: `${character.name} con ${round.ok.toLowerCase()}`,
            good: `¡Muy bien! ${character.name} ya puede ${i === 0 ? "ir a la escuela" : i === 1 ? "hacer ejercicio" : "dormir"}.`,
            items: character.outfits,
        };
    }

    function render() {
        const character = characters[activeCharacter];
        const r = getRound();
        gameTitle.textContent = `Viste a ${character.name}`;
        $("#clothes-when").textContent = r.when;
        speakPrompt(gameTitle, $("#clothes-when"));
        $("#occasion-badge").textContent = r.occasion;
        scene.className = "dress-scene " + r.cls;
        characterImage.src = character.baseImage;
        characterImage.alt = `${character.name} antes de vestirse`;

        $("#outfit-picker").innerHTML = r.items.map(([image, name]) =>
            `<button class="outfit-option" type="button" data-name="${name}" data-image="${image}" aria-label="${name}">
                <img src="${image}" alt=""><span>${name}</span></button>`
        ).join("");

        $$(".outfit-option").forEach((b) =>
            draggable(b, { target: () => scene, onDrop: place, onTap: place })
        );

        tries = 0;
        locked = false;
        setFeedback(fb, ` ${character.name}.`, "");
    }

    function place(btn) {
        if (locked) return;
        const r = getRound();

        if (btn.dataset.name === r.ok) {
            locked = true;
            characterImage.src = r.dressedImage;
            characterImage.alt = r.dressedAlt;
            if (tries === 0) stars++;
            sfx.ok();
            setFeedback(fb, r.good, "success");
            roundAdvanceTimeout = setTimeout(() => {
                i++;
                if (i >= rounds.length) {
                    finish("clothes", Math.max(1, stars), `¡${characters[activeCharacter].name} se vistió genial gracias a ti!`, start);
                } else {
                    render();
                }
            }, 1500);
        } else {
            tries++;
            shake(btn);
            sfx.no();
            setFeedback(fb, "Mmm, esa ropa no es para hoy. ¡Prueba otra!", "try-again");
        }
    }

    function start() {
        clearTimeout(roundAdvanceTimeout);
        i = 0;
        stars = 0;
        render();
    }

    characterChoices.forEach((choice) => {
        choice.addEventListener("click", () => {
            activeCharacter = choice.dataset.dressCharacter;
            characterSelect.hidden = true;
            gameScreen.hidden = false;
            start();
            $("#outfit-picker .outfit-option").focus();
        });
    });

    $("#change-character").addEventListener("click", () => {
        clearTimeout(roundAdvanceTimeout);
        gameScreen.hidden = true;
        characterSelect.hidden = false;
        characterChoices.find((choice) => choice.dataset.dressCharacter === activeCharacter).focus();
    });
})();

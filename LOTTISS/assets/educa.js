const homeView = document.querySelector("#home-view");
const gamesView = document.querySelector("#juegos");
const rewardsView = document.querySelector("#recompensas");
const gameScreens = [...document.querySelectorAll(".game-screen")];

function showCurrentView() {
    const currentGame = gameScreens.find((screen) => `#${screen.id}` === window.location.hash);
    const showingGames = window.location.hash === "#juegos";
    const showingRewards = window.location.hash === "#recompensas";

    homeView.hidden = Boolean(currentGame) || showingRewards || showingGames;
    gamesView.hidden = Boolean(currentGame) || !showingGames;
    rewardsView.hidden = !showingRewards;
    gameScreens.forEach((screen) => {
        screen.hidden = screen !== currentGame;
    });
    document.body.classList.toggle("game-active", Boolean(currentGame));

    if (currentGame || showingRewards) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (showingGames) {
        requestAnimationFrame(() => {
            gamesView.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
}

window.addEventListener("hashchange", showCurrentView);
showCurrentView();

const drinkFeedback = document.querySelector("#drink-feedback");
const drinkChoices = [...document.querySelectorAll("[data-drink-choice]")];

drinkChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
        const isCorrect = choice.dataset.drinkChoice === "Agua";
        drinkChoices.forEach((item) => {
            item.classList.toggle("correct", item === choice && isCorrect);
            item.classList.toggle("incorrect", item === choice && !isCorrect);
            item.setAttribute("aria-pressed", String(item === choice));
        });
        drinkFeedback.textContent = isCorrect
            ? "¡Muy bien! El agua ayuda a tu cuerpo a mantenerse hidratado."
            : "Inténtalo otra vez. Después de comer, el agua es la mejor opción.";
        drinkFeedback.classList.toggle("success", isCorrect);
        drinkFeedback.classList.toggle("try-again", !isCorrect);
    });
});

const fruitPlate = document.querySelector("#fruit-plate");
const plateFruits = document.querySelector("#plate-fruits");
const fruitCount = document.querySelector("#fruit-count");
const foodFeedback = document.querySelector("#food-feedback");
const foodMessage = document.querySelector("#food-message");
const foodOptions = [...document.querySelectorAll(".food-option")];
const fruitEmojis = {
    Manzana: "🍎",
    Plátano: "🍌",
    Fresa: "🍓",
};
let collectedFruits = 0;

function addFoodToPlate(option) {
    if (!option || option.disabled) {
        return;
    }

    if (option.dataset.fruit !== "true") {
        foodMessage.textContent = "Ese alimento no es una fruta. ¡Busca una fruta!";
        foodFeedback.className = "game-feedback try-again";
        return;
    }

    option.disabled = true;
    option.classList.add("added");
    plateFruits.textContent += fruitEmojis[option.dataset.food];
    collectedFruits += 1;
    fruitCount.textContent = String(collectedFruits);

    if (collectedFruits === 3) {
        foodMessage.textContent = "¡Excelente! Llenaste el plato con frutas saludables.";
        foodFeedback.className = "game-feedback success";
    } else {
        foodMessage.textContent = "¡Buena elección! Frutas saludables agregadas:";
        foodFeedback.className = "game-feedback";
    }
}

foodOptions.forEach((option) => {
    option.addEventListener("click", () => addFoodToPlate(option));
    option.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", option.dataset.food);
        event.dataTransfer.effectAllowed = "move";
    });
});

fruitPlate.addEventListener("dragover", (event) => {
    event.preventDefault();
    fruitPlate.classList.add("drag-over");
});

fruitPlate.addEventListener("dragleave", (event) => {
    if (!fruitPlate.contains(event.relatedTarget)) {
        fruitPlate.classList.remove("drag-over");
    }
});

fruitPlate.addEventListener("drop", (event) => {
    event.preventDefault();
    fruitPlate.classList.remove("drag-over");
    const foodName = event.dataTransfer.getData("text/plain");
    addFoodToPlate(foodOptions.find((option) => option.dataset.food === foodName));
});

const outfitOptions = [...document.querySelectorAll(".outfit-option")];
const outfitDisplay = document.querySelector("#outfit-display");
const outfitFeedback = document.querySelector("#clothes-feedback");
let selectedOutfit = "";

outfitOptions.forEach((option) => {
    option.addEventListener("click", () => {
        selectedOutfit = option.dataset.outfit;
        outfitDisplay.textContent = selectedOutfit;
        outfitOptions.forEach((item) => {
            const isSelected = item === option;
            item.classList.toggle("selected", isSelected);
            item.setAttribute("aria-pressed", String(isSelected));
        });
        outfitFeedback.textContent = "¡Linda elección! Cuando quieras, toca «¡Listo!».";
        outfitFeedback.className = "game-feedback";
    });
});

document.querySelector("#outfit-done").addEventListener("click", () => {
    if (!selectedOutfit) {
        outfitFeedback.textContent = "Primero elige una prenda para Lily.";
        outfitFeedback.className = "game-feedback try-again";
        return;
    }

    outfitFeedback.textContent = "¡Lily está lista y se ve genial!";
    outfitFeedback.className = "game-feedback success";
});

const rewardCharacterStep = document.querySelector("#reward-character-step");
const rewardWardrobe = document.querySelector("#reward-wardrobe");
const rewardCharacterName = document.querySelector("#reward-character-name");
const rewardPreviewImage = document.querySelector("#reward-preview-image");
const rewardPreviewOutfit = document.querySelector("#reward-preview-outfit");
const rewardCharacterChoices = [...document.querySelectorAll("[data-character-select]")];
const rewardOutfitOptions = [...document.querySelectorAll(".reward-outfit-option")];
const rewardsFeedback = document.querySelector("#rewards-feedback");

const rewardOutfits = {
    lily: {
        image: "img/Jake y Lily.pdf (4).png",
        name: "Ropa de estrellas",
    },
    jake: {
        image: "img/Jake y Lily.pdf (5).png",
        name: "Look explorador",
    },
};
let activeRewardCharacter = "";

function chooseRewardCharacter(character) {
    const characterName = character === "lily" ? "Lily" : "Jake";
    const outfit = rewardOutfits[character];

    activeRewardCharacter = character;
    rewardCharacterName.textContent = characterName;
    rewardPreviewImage.src = outfit.image;
    rewardPreviewImage.alt = `${characterName} con ${outfit.name.toLowerCase()}`;
    rewardPreviewOutfit.textContent = outfit.name;
    rewardsFeedback.textContent = `¡Escoge un atuendo para ${characterName}!`;
    rewardCharacterStep.hidden = true;
    rewardWardrobe.hidden = false;

    rewardCharacterChoices.forEach((choice) => {
        choice.setAttribute("aria-pressed", String(choice.dataset.characterSelect === character));
    });
    rewardOutfitOptions.forEach((option) => {
        const isForCharacter = option.dataset.outfitCharacter === character;
        option.hidden = !isForCharacter;
        option.setAttribute("aria-pressed", String(isForCharacter && option.dataset.outfitName === outfit.name));
    });
    rewardOutfitOptions.find((option) => option.dataset.outfitName === outfit.name).focus();
}

rewardCharacterChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
        chooseRewardCharacter(choice.dataset.characterSelect);
    });
});

rewardOutfitOptions.forEach((option) => {
    option.addEventListener("click", () => {
        if (option.dataset.outfitCharacter !== activeRewardCharacter) {
            return;
        }

        const characterName = activeRewardCharacter === "lily" ? "Lily" : "Jake";
        rewardOutfits[activeRewardCharacter] = {
            image: option.dataset.outfitImage,
            name: option.dataset.outfitName,
        };
        rewardPreviewImage.src = option.dataset.outfitImage;
        rewardPreviewImage.alt = `${characterName} con ${option.dataset.outfitName.toLowerCase()}`;
        rewardPreviewOutfit.textContent = option.dataset.outfitName;
        rewardOutfitOptions.forEach((item) => {
            item.setAttribute("aria-pressed", String(item === option));
        });
        rewardsFeedback.textContent = `¡A ${characterName} le queda genial ${option.dataset.outfitName.toLowerCase()}!`;
    });
});

document.querySelector("#reward-change-character").addEventListener("click", () => {
    const previousCharacter = activeRewardCharacter;
    activeRewardCharacter = "";
    rewardWardrobe.hidden = true;
    rewardCharacterStep.hidden = false;
    rewardCharacterChoices.forEach((choice) => choice.setAttribute("aria-pressed", "false"));
    rewardCharacterChoices.find((choice) => choice.dataset.characterSelect === previousCharacter).focus();
});

// Handles dynamic rendering of index.html

import { GameHandler } from "./game";
import { Config } from "./config";
import { decrementDeleteIfZero } from "./util";

class IndexComponent {

    public gameHandler: GameHandler = undefined;
    public uiUpdatesInterval: NodeJS.Timer | null = null;

    constructor() {
        this.gameHandler = new GameHandler();
        this.uiUpdatesInterval = null;

        this.initGUI();
        this.initListeners();
    }

    initListeners() {
        document.querySelectorAll(".keyboard-tile:not(.special)").forEach((element) => element.addEventListener('click', this.handleClickKey.bind(this)));
        document.querySelectorAll(".keyboard-tile:not(.special)").forEach((element) => element.addEventListener('click', this.handleClickKey.bind(this)));
        document.getElementById("play-again-title").addEventListener("click", this.handleClickPlayAgain.bind(this));

        window.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }

            const element: HTMLElement = document.querySelector(`.keyboard-tile[data-key-char="${event.key.toLowerCase()}"`);

            if (element) {
                element.click();
            }

            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
        }, true);

    }

    initGUI() {
        document.getElementById("play-again-title").classList.add("none");

        const letterTileContainers = document.getElementById("letter-tile-containers");
        while (letterTileContainers.firstChild) {
            letterTileContainers.removeChild(letterTileContainers.firstChild);
        }
        const keyTileContainers = document.getElementById("keyboard-containers");
        while (keyTileContainers.firstChild) {
            keyTileContainers.removeChild(keyTileContainers.firstChild);
        }

        // Initialize GUI: add tiles and container
        for (let tryIndex = 0; tryIndex < Config.NUM_TRIES; tryIndex++) {
            const container = document.createElement('div');
            container.className = "letter-tile-container";
            container.id = "letter-tile-container-" + tryIndex;
            container.dataset.tryIndex = tryIndex.toString();
            document.querySelector("#letter-tile-containers").appendChild(container);

            for (let letterIndex = 0; letterIndex < Config.NUM_LETTERS; letterIndex++) {
                const tile = this.getTile(tryIndex, letterIndex);
                document.querySelector("#letter-tile-container-" + tryIndex).appendChild(tile);
            }
        }

        for (let keyboardRowIndex = 0; keyboardRowIndex < Config.KEYBOARD_LAYOUT.length; keyboardRowIndex++) {
            const container = document.createElement('div');
            container.className = "keyboard-container";
            container.id = "keyboard-container-" + keyboardRowIndex;
            container.dataset.keyboardRowIndex = keyboardRowIndex.toString();
            document.querySelector("#keyboard-containers").appendChild(container);

            for (let keyCharIndex = 0; keyCharIndex < Config.KEYBOARD_LAYOUT[keyboardRowIndex].length; keyCharIndex++) {
                const keyChar = Config.KEYBOARD_LAYOUT[keyboardRowIndex][keyCharIndex];
                const isBig = Config.KEYBOARD_LAYOUT_BIG_KEYS.includes(keyChar);
                const keyTile = this.getKeyTile(keyChar, isBig);
                document.querySelector("#keyboard-container-" + keyboardRowIndex).appendChild(keyTile);
            }
        }
    }

    handleClickGuess(event: Event) {
        const guessArray = this.getCurrentGuess();
        const currentTry = this.gameHandler.currentTry;

        if (guessArray.length != Config.NUM_LETTERS || currentTry > Config.NUM_TRIES) {
            return;
        }

        const result = this.gameHandler.makeGuess(guessArray);
        const matchIndexes = result.matchIndexes;
        const closeMap = result.closeMap;

        // Do the coloring of the tiles. The most important part!
        if (matchIndexes && closeMap) {
            const uiUpdatesTiles = [];
            for (let element of Array.from(document.querySelectorAll("#letter-tile-container-" + currentTry + " .letter-tile"))) {
                if (element instanceof HTMLElement && element.firstChild instanceof HTMLElement) {
                    const tileKeyValue = element.firstChild.dataset.value.toLowerCase();
                    const keyboardKey = document.querySelector(`[data-key-char="${tileKeyValue}"]`);

                    // If it matches, color both the tile and the keyboard key
                    if (matchIndexes.includes(parseInt(element.dataset.letterIndex))) {
                        uiUpdatesTiles.push(["tile-match", "with-animation"]);
                        keyboardKey.className = "keyboard-tile tile-match";
                        continue;
                    }

                    const classArray = Array.from(keyboardKey.classList);

                    // If it's close, color both the tile and the keyboard key
                    // Handle a case where we get duplicate letter entries by blacklisting it.
                    if (closeMap.has(tileKeyValue)) {
                        uiUpdatesTiles.push(["tile-close", "with-animation"]);

                        if (!classArray.includes("tile-match")) {
                            keyboardKey.classList.add("tile-close");
                        }

                        decrementDeleteIfZero(closeMap, tileKeyValue);
                        continue;
                    }

                    // If it's wrong, color the keyboard key but only if we haven't already determined the key is correct elsewhere
                    if (!classArray.includes("tile-close") && !classArray.includes("tile-match")) {
                        keyboardKey.classList.add("tile-wrong");
                    }
                    uiUpdatesTiles.push(["tile-wrong", "with-animation-wrong"]);
                }
            }
            this.doUIUpdates(uiUpdatesTiles, currentTry);
        } else {
            this.handleError(result.error);
            return;
        }

        if (result.win) {
            this.handleEndGame(true);
            return;
        }

        if (currentTry >= Config.NUM_TRIES - 1) {
            console.log(guessArray);
            this.handleEndGame(false);
        }
    }

    handleClickPlayAgain(event: Event) {
        if (event.defaultPrevented || this.gameHandler.active) {
            return;
        }
        this.gameHandler.init();
        this.initGUI();
        this.initListeners();

        event.preventDefault();
    }

    handleEndGame(win: boolean) {
        setTimeout(() => {
            if (win) {
                alert("You win :)");
            } else {
                alert("You lose. :( The word was " + this.gameHandler.currentWord.join("").toUpperCase());
            }
            this.gameHandler.active = false;
            document.getElementById("play-again-title").classList.remove("none");
        }, Config.UI_UPDATE_SPEED * (Config.NUM_LETTERS + 1));
    }

    handleError(error: string) {
        alert(error);
    }

    getCurrentGuess() {
        const currentTry = this.gameHandler.currentTry;
        const currentContainerTiles = Array.from(document.querySelectorAll("#letter-tile-container-" + currentTry + " .letter-tile-text"));
        return currentContainerTiles.map((element) => element instanceof HTMLElement ? element.dataset.value.toLowerCase() : '');
    }

    handleClickKey(event: Event) {
        if (event.defaultPrevented || !this.gameHandler.active) {
            return;
        }

        event.preventDefault();

        if (this.uiUpdatesInterval != null) {
            return;
        }

        if (!(event.target instanceof HTMLElement)) {
            return;
        }

        const keyChar = event.target.dataset.keyChar;
        if (keyChar === "enter") {
            this.handleClickGuess(event);
            return;
        }

        const guessArray = this.getCurrentGuess();
        if (this.gameHandler.currentTry >= Config.NUM_TRIES) {
            return;
        }

        if (keyChar === "backspace") {
            if (guessArray.length === 0) {
                return;
            }

            const tileToDelete = document.querySelector(`[data-try-index="${this.gameHandler.currentTry}"][data-letter-index="${guessArray.length - 1}"]`);
            tileToDelete.removeChild(tileToDelete.firstChild);
            return;
        }

        if (guessArray.length === Config.NUM_LETTERS) {
            return;
        }

        const tileToAdd = document.querySelector(`[data-try-index="${this.gameHandler.currentTry}"][data-letter-index="${guessArray.length}"]`);
        const tileSpan = document.createElement('span');
        tileSpan.innerHTML = keyChar.toUpperCase();
        tileSpan.dataset.value = keyChar;
        tileSpan.className = "letter-tile-text";
        tileToAdd.appendChild(tileSpan);
    }

    // Creates a letter tile
    getTile(tryIndex: number, letterIndex: number) {
        const tile = document.createElement('div');
        tile.className = "letter-tile";
        tile.dataset.tryIndex = tryIndex.toString();
        tile.dataset.letterIndex = letterIndex.toString();

        return tile;
    }

    // Creates a key tile that will be used for the keyboard
    getKeyTile(keyChar: string, isBig: boolean) {
        const keyTile = document.createElement('div');
        const keySpan = document.createElement('span');
        keySpan.innerHTML = keyChar.toUpperCase();
        keySpan.dataset.keyChar = keyChar;
        keySpan.className = "keyboard-tile-text";

        if (keyChar === "backspace") {
            keySpan.innerHTML = "←";
        }

        keyTile.appendChild(keySpan);
        keyTile.className = "keyboard-tile";
        if (isBig) {
            keyTile.classList.add("is-big");
        }
        keyTile.dataset.keyChar = keyChar;

        return keyTile;
    }

    doUIUpdates(classes: string[][], currentTry: number) {
        let i = 0;
        this.uiUpdatesInterval = setInterval(() => {
            const element = document.querySelector(`#letter-tile-container-${currentTry} .letter-tile[data-letter-index="${i}"]`);
            element.classList.add(...classes[i]);

            i++;

            if (i === Config.NUM_LETTERS) {
                clearInterval(this.uiUpdatesInterval);
                this.uiUpdatesInterval = null;
            }
        }, Config.UI_UPDATE_SPEED);
    }
}

export const indexComponent = new IndexComponent();
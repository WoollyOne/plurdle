// Handles game logic;

import { gameDict } from "./gamedict.js";
import { validDict } from "./validdict.js";
import { incrementSetIfNotPresent } from "./util.js";

export class GameHandler {
    constructor() {
        this.init();
    }

    init() {
        const NUM_WORDS = gameDict.length;
        this.currentWord = [];

        // It's rare that this will happen but it does happen. Not super efficient. Maybe I'll fix later.
        while (!validDict.includes(this.currentWord.join(""))) {
            console.log("Initializing... finding a new word", this.currentWord.join(""));
            this.currentWord = gameDict[NUM_WORDS * Math.random() | 0].split("");
        }
        this.currentTry = 0;
        this.active = true;
    }

    // guess: array, currentWord: array
    // return: object
    makeGuess(guess, currentWord) {
        const guessString = guess.join("");
        if (!validDict.includes(guessString)) {
            return { win: false, error: guessString.toUpperCase() + " is not a valid word." };
        }
        else if (guessString === currentWord.join("")) {
            return { win: true, matchIndexes: [...Array(currentWord.length).keys()], closeMap: new Map() };
        } else {
            // Find all letters where index is the same as the secret word.
            // If we have a match, block it out of the array so we don't accidentally count it twice.
            // This is also important for the "close" array, because we don't want any characters to
            // be included that were already found. But since characters can repeat, we should still
            // count it.
            const currentWordCopy = currentWord.slice();
            const matchIndexes = [];
            guess.forEach((char, index) => {
                const currentWordIndexOf = currentWordCopy.indexOf(char);
                const doesMatch = currentWordIndexOf === index;

                if (doesMatch) {
                    currentWordCopy[index] = "";
                    matchIndexes.push(currentWordIndexOf);
                }
            });

            // Find all letters that are not matches but are in the secret word
            const close = currentWordCopy.filter((char) => guess.indexOf(char) !== -1);
            const closeMap = new Map();
            close.forEach((char) => incrementSetIfNotPresent(closeMap, char));

            this.currentTry += 1;
            return { win: false, matchIndexes: matchIndexes, closeMap: closeMap };
        }
    }

    doTests() {
        console.log(makeGuess("TRUES", "TRUES"));
        console.log(makeGuess("TURNS", "TRUES"));
        console.log(makeGuess("COINS", "TRUES"));
    }
}
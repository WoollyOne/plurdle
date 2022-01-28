import { assert } from "console";
import { Config } from "../config";
import { GameHandler } from "../game";
import { TestFramework } from "./testframework";

type GuessTestSet = {currentWord: string[]; guess: string[]; expectedMatch: number[] | undefined, expectedClose: Map<string, number> | undefined, expectedError: boolean};

export class GameHandlerSpec implements TestFramework {
    constructor() { }

    public runTestSuite(): boolean {
        return this.testInit() && this.testGuesser();
    }

    public testInit(): boolean {
        const gameHandler = new GameHandler();
        
        if(gameHandler.currentTry !== 0) {
            console.error("Current try wasn't 0");
            return false;
        }

        if(gameHandler.currentWord.length !== Config.NUM_LETTERS) {
            console.error("Current word was wrong length");
            return false;
        }

        if(gameHandler.active === false) {
            console.error("GameHandler was not active");
            return false;
        }

        return true;
    }

    public testGuesser(): boolean {
        const gameHandler = new GameHandler();

        let test = 1;
        let failures = 0;
        let successes = 0;
        let total = this.guessTestSet.length;
        
        const red = "\x1b[31m%s\x1b[0m";
        const green = "\x1b[32m%s\x1b[0m"; //green

        for(const guessTest of this.guessTestSet) {
            let color = green;
            gameHandler.currentTry = 0;
            gameHandler.currentWord = guessTest.currentWord;

            const result = gameHandler.makeGuess(guessTest.guess);
            let fallthrough = false;
            let fail = false;

            const foundError = result.error !== undefined;

            if(guessTest.expectedError && foundError) {
                fallthrough = true;
            } else if(guessTest.expectedError !== foundError){
                fail = true;
                color = red;
            }

            if(!fallthrough && Array.from(guessTest.expectedClose.entries()).sort().toString() !== Array.from(result.closeMap.entries()).sort().toString()) {
                fail = true;
                color = red;
            }

            if(!fallthrough && guessTest.expectedMatch.join("") !== result.matchIndexes.join("")) {
                fail = true;
                color = red;
            }

            if(fail) {
                console.error(color, `>>>>>>>> ERROR! Failed comparison test ${test}.`);
                console.error(color, `>>>>>>>>>> Current Word:`, guessTest.currentWord.join("").toUpperCase());
                console.error(color, `>>>>>>>>>> Guess Word:`, guessTest.guess.join("").toUpperCase());
                console.error(color, `>>>>>>>>>> Expected CLOSE:`, Array.from(guessTest.expectedClose.entries()));
                console.error(color, `>>>>>>>>>> Expected MATCH:`, guessTest.expectedMatch);
                console.error(color, `>>>>>>>>>> Expected ERROR:`, guessTest.expectedError);
                console.error("------------------------------------------------------------");
                console.error(color, `>>>>>>>>>> Resultant CLOSE:`, Array.from(result.closeMap?.entries()));
                console.error(color,`>>>>>>>>>> Resultant MATCH:`, result.matchIndexes);
                console.error(color, `>>>>>>>>>> Resultant ERROR:`, result.error ?? false);
                console.error("============================================================");
                failures++;
            }
            else {
                console.log(color, ">>>>>>>>>> PASSED: " + test);
                console.log(color, `>>>>>>>>>> Current Word:`, guessTest.currentWord.join("").toUpperCase());
                console.log(color, `>>>>>>>>>> Guess Word:`, guessTest.guess.join("").toUpperCase());
                console.error(color, `>>>>>>>>>> Resultant Error:`, result.error ?? false);
                console.log("============================================================");
                successes++;
            }

            test++;
        }

        console.log(`>>>>>>>> ${failures} FAILURE(S) ${successes} SUCCESS(ES) ${total} TOTAL`);

        if(failures > 0) {
            return false;
        }

        return true;
    }

    private stringifyMap(map: Map<string, number>) {
        return JSON.stringify(Array.from(map.entries()));
    }

    public name: string = "GameHandler Spec";

    public readonly guessTestSet: GuessTestSet[] = [
            {
                currentWord: ["s", "p", "e", "a", "k"], 
                guess:       ["s", "p", "e", "a", "k"], 
                expectedMatch: [0,1,2,3,4],
                expectedClose: new Map<string, number>(),
                expectedError: false
            },
            {
                currentWord: ["s", "p", "e", "a", "k"], 
                guess:       ["s", "t", "e", "a", "k"], 
                expectedMatch: [0,2,3,4],
                expectedClose: new Map<string, number>(),
                expectedError: false
            },
            {
                currentWord: ["s", "p", "e", "a", "k"], 
                guess:       ["f", "t", "e", "r", "k"], 
                expectedMatch: [],
                expectedClose: new Map<string, number>(),
                expectedError: true
            },
            {
                currentWord: ["s", "p", "e", "a", "k"], 
                guess:       ["s", "e", "a", "r", "s"], 
                expectedMatch: [0],
                expectedClose: new Map<string, number>([["e", 1], ["a", 1]]),
                expectedError: false
            },
            {
                currentWord: ["s", "p", "e", "e", "l"], 
                guess:       ["r", "e", "s", "e", "t"], 
                expectedMatch: [3],
                expectedClose: new Map<string, number>([["s", 1], ["e", 1]]),
                expectedError: false
            },
            {
                currentWord: ["s", "t", "e", "e", "l"], 
                guess:       ["r", "e", "s", "e", "t"], 
                expectedMatch: [3],
                expectedClose: new Map<string, number>([["e", 1], ["s", 1], ["t", 1]]),
                expectedError: false
            },
            {
                currentWord: ["l", "a", "t", "t", "e"], 
                guess:       ["p", "l", "a", "n", "k"], 
                expectedMatch: [],
                expectedClose: new Map<string, number>([["l", 1], ["a", 1]]),
                expectedError: false
            },
            {
                currentWord: ["l", "a", "t", "t", "e"], 
                guess:       ["m", "a", "t", "t", "e"], 
                expectedMatch: [1,2,3,4],
                expectedClose: new Map<string, number>(),
                expectedError: false
            },
            {
                currentWord: ["l", "a", "t", "t", "e"], 
                guess:       ["s", "p", "i", "n", "s"], 
                expectedMatch: [],
                expectedClose: new Map<string, number>(),
                expectedError: false
            },
            {
                currentWord: ["l", "a", "t", "t", "e"], 
                guess:       ["k", "p", "i", "n", "s"], 
                expectedMatch: [],
                expectedClose: new Map<string, number>(),
                expectedError: true
            },
            {
                currentWord: ["p", "o", "o", "l", "s"], 
                guess:       ["s", "p", "o", "o", "l"], 
                expectedMatch: [2],
                expectedClose: new Map<string, number>([["p", 1], ["o", 1], ["l", 1], ["s", 1]]),
                expectedError: false
            },
            {
                currentWord: ["o", "b", "o", "e", "s"], 
                guess:       ["t", "a", "b", "o", "o"], 
                expectedMatch: [],
                expectedClose: new Map<string, number>([["o", 2], ["b", 1]]),
                expectedError: false
            },
            {
                currentWord: ["c", "o", "o", "l", "s"], 
                guess:       ["o", "b", "o", "e", "s"], 
                expectedMatch: [2,4],
                expectedClose: new Map<string, number>([["o", 1]]),
                expectedError: false
            },
            {
                currentWord: ["s", "h", "e", "e", "t"], 
                guess:       ["p", "a", "r", "e", "s"], 
                expectedMatch: [3],
                expectedClose: new Map<string, number>([["e", 1], ["s", 1]]),
                expectedError: false
            }
        ]
}
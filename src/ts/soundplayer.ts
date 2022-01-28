declare var require: any
import * as howler from 'howler';

export class SoundPlayer {
    public sounds = new Map<string, howler.Howl>();
     
    constructor() {
        this.initSounds(); 
    }

    public initSounds() {
        this.sounds.set("click", this.getHowl("click"));
        this.sounds.set("close", this.getHowl("close"));
        this.sounds.set("error", this.getHowl("error"));
        this.sounds.set("lose", this.getHowl("lose"));
        this.sounds.set("match0", this.getHowl("match0"));
        this.sounds.set("match1", this.getHowl("match1"));
        this.sounds.set("match2", this.getHowl("match2"));
        this.sounds.set("match3", this.getHowl("match3"));
        this.sounds.set("match4", this.getHowl("match4"));
        this.sounds.set("win", this.getHowl("win"));
        this.sounds.set("wrong", this.getHowl("wrong"));

    }

    public playSound(name: string) {
        this.sounds.get(name).play();
    }

    public getHowl(key: string): howler.Howl {
        return new howler.Howl({src: [`sound/${key}.wav`]});
    }
}
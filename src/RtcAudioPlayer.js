import { EventEmitter } from "eventemitter3";

/**
 * 提供自定义的音频播放类, 以实现 rtc 混音效果。
 * 必须实现了标准的 EventEmitter 相关接口, 因为 `@netless/slide` 库需要监听 'load'、'play'、'pause'事件。
 * 以上三个事件必须实现。
 */
export class RtcAudioPlayer extends EventEmitter {
    constructor(src) {
        super();
        this.audio = new Audio(src);
        this.audio.addEventListener("loadeddata", () => {
            // 在音频时长数据获取后, 触发 'load' 事件
            this.emit("load");
        });
        this.audio.addEventListener("play", () => {
            this.emit("play");
        });
        this.audio.addEventListener("pause", () => {
            this.emit("pause");
        });
        this.audio.load();
    }

    play() {
        console.log("使用 rtc 播放器");
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    destroy() {
        //
    }

    get currentTime() {
        return this.audio.currentTime;
    }
    set currentTime(t) {
        this.audio.currentTime = t;
    }

    get isPaused() {
        return this.audio.paused;
    }

    get duration() {
        return this.audio.duration;
    }

}
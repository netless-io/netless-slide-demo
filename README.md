# netless-slide demo

[English](./README_EN.md) | 简体中文

这个项目是 `@netless/slide` 库的前端示例, 需要已经完成文档转换并且获取了 `taskId` 和 `prefixUrl` 才能进一步使用 `@netless/slide` 在浏览器中展示 ppt。

[在线演示](https://netless-io.github.io/netless-slide-demo/)

## 基本使用

### 初始化 `Slide` 对象

要初始化 `Slide` 对象, 至少要指定三项配置

|  key   | type  | description |
|  ----  | ----  | ---         |
| anchor | HTMLElement | 作为 `Slide` 渲染出的 `canvas` 元素的挂载点 |
| interactive  | boolean |ppt 是否可交互, 不可交互的 ppt 无法响应用户的事件|
| mode  | "local" &#124; "interactive" |local: 单机模式, Slide 对象不会触发任意同步事件。<br/>interactive: 互动模式, 所有客户端都可以交互|

```javascript
import { Slide } from "@netless/slide";

const slide = new Slide({
    anchor: someDivElement,
    interactive: true,
    mode: "local",
});
```

### 设置转换资源

`Slide` 对象创建之后, 下一步需要设置转换后的资源。`taskId` 为一串 hash 字符串代表一次转换任务 id, `prefixUrl` 为一段 url 地址, 指向转换后的资源根路径。这两个参数都可以从 [转码服务的进度查询 api](https://developer.netless.link/server-zh/home/server-projector) 中获取.

`注意`: 你需要保证访问 prefixUrl 路径里的资源不会跨域。

```javascript

slide.setResource("06415a307f2011ec8bdc15d18ec9acc7", "https://convertcdn.netless.group/dynamicConvert");

```

### 渲染 ppt 页面

设置好转换资源后，就可以调用 `renderSlide` 渲染页面了, 传入参数是 ppt 页码, 页码从 1 开始。你也可以调用 `renderSlide` 跳转到任意页码。  
你需要确保传入的页码在原始 ppt 页数范围内, 访问 `slide.slideCount` 可以获取总页数 

```javascript
// 渲染第一页
slide.renderSlide(1);

// 渲染最后一页
slide.slideCount(slide.slideCount);
```

## Slide 生命周期与事件触发时机

![lifecycle](./assets/slide-lifecycle.svg)

## 可选配置项

### `Slide` 配置

初始化 `Slide` 还有一些可选的配置项，说明如下

```javascript
const slide = new Slide({
    anchor: someDivElement,
    interactive: true,
    mode: "local",
    // 以下为可选配置
    resize: false,
    enableGlobalClick: false,
    timestamp: Date.now,
    renderOptions: {
        
    }
});
```

| key               | type                             | description                                                                                                                                                                                                                |
|-------------------|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| resize            | boolean                          | **默认值:** false <br/> 设置是否根据窗口大小自动调整分辨率。<br/> 默认情况下 ppt 的 css 尺寸会随着 anchor 元素的大小而变化, 但是 canvas 元素的渲染分辨率不会变化。将此值设置为 true, 会使 canvas 的分辨率也跟随缩放比例缩放，这样能获得更好的性能，但是当 anchor 的 css 尺寸太小的情况下，也会导致画面模糊。<br /> 除非遇到性能问题，一般不建议设置为 true 。 |
| enableGlobalClick | boolean                          | **默认值:** false <br/> 用于控制是否可以通过点击 ppt 画面执行下一步功能。<br /> 建议移动端开启，移动端受限于屏幕尺寸，交互 UI 较小，如果开启此功能会比较方便执行下一步。                                                                                                                      |
| timestamp         | () => number                     | **默认值:** Date.now <br/> 此函数用于获取当前时间, 在同步及互动场景下，ppt 内部需要知道当前时间，这个时间对于参与同步(互动)的多个客户端应该是一致的，这个时间越精确，画面同步也越精确。<br />建议通过后端服务，为多个客户端下发相同的时间。                                                                                    |
| rtcAudio          | RtcAudioClazz                    | **默认值:** null <br/> 用于 rtc 混音, 具体用法见下文                                                                                                                                                                                     |
| logger            | ILogger                          | **默认值:** null <br/> 用于接受日志, 具体用法见下文                                                                                                                                                                                        |
| useLocalCache     | boolean                          | **默认值:** true <br/> 是否启用本地缓存，启用后会将 ppt 远程资源缓存在 indexDB 中                                                                                                                                                                   |
| renderOptions     | ISlideRenderOptions 对象           | 见下表                                                                                                                                                                                                                        |
| urlInterrupter    | (url: string) => Promise&lt;string&gt; | **默认值:** url <br/> 根据公开地址返回可访问地址(用于私有存储服务)                                                                                                                                                                                 |
| navigatorDelegate | INavigatorDelegate               | **默认值:** undefined <br/> PPT 页面导航代理，添加此属性后，ppt 内部动作导致的页码变化，都经过此代理逻辑。PPT 打开网页需要通过 openUrl 方法，PPT 翻页需要通过 gotoPage 方法。具体用法见下文"添加自定义 link"部分。                                                                                             |
| customLinks       | CustomLink[]                     | **默认值:** undefined <br/> 自定义链接配置数组，用于给 PPT 中的元素添加自定义跳转链接。具体用法见下文"添加自定义 link"部分。                                                                                                                                                                  |
| clientId          | string                           | **默认值:** undefined <br/> 客户端唯一标识，在同步和互动场景下需要能够区分每个不同的客户端。对于接收同步消息的一端，需要用此 ClientId 区分是否收到了自己发送的消息。如果在同步和互动场景下不提供此值，可能会导致某些情况下状态不同步。                                                                                 |
| enableTracking    | boolean                          | **默认值:** true <br/> 是否启用日志追踪，启用后会定期定量将本地日志上传到 sdk 远程服务器                                                                                                                                                                          |
| enableWebAudio    | boolean                          | **默认值:** false <br/> 是否使用 Web Audio API 播放声音                                                                                                                                                                               |
| resourceTimeout   | number                           | **默认值:** 15000 <br/> 资源加载超时时间，单位毫秒                                                                                                                                                                                  |
| fixedFrameSize    | { width: number; height: number; } | **默认值:** undefined <br/> 为 ppt 设置固定的宽度和高度，设置后 ppt 不会随父元素大小自动变化。如果有缩放需求，需要调用 updateFixedFrameSize 方法。width 和 height 属性的单位是 px。                                                                                                               |

#### urlInterrupter 举例
```ts
const urlInterrupter = async (url: string) => {
    // 根据不同的云存储服务会有不同的实现, 一般都是在查询参数添加签名
    const { ak, expire } = await getSTSToken() // 客户服务端实现
    return `${url}?expire=${expire}&ak=${ak}`
};
```


### ISlideRenderOptions 配置

|  key   | type  | description |
|  ----  | ----  | ---         |
| minFPS | number | **默认值:** 40 <br/> 设置最小 fps, 应用会尽量保证实际 fps 高于此值, 此值越小, cpu 开销越小。 |
| maxFPS | number | **默认值:** 50 <br/> 设置最大 fps, 应用会保证实际 fps 低于此值, 此值越小, cpu 开销越小。 |
| resolution | number | **默认值:** pc 浏览器为 window.devicePixelRatio; 移动端浏览器为 1 。<br/> 设置渲染分辨倍率, 原始 ppt 有自己的像素尺寸，当在 2k 或者 4k 屏幕下，如果按原始 ppt 分辨率显示，画面会比较模糊。可以调整此值，使画面更清晰，同时性能开销也变高。<br /> 建议保持默认值就行，或者固定为 1。 |
| autoResolution | boolean | **默认值:** false, 控制是否根据运行时实际 fps 自动缩放渲染分辨率, 使得运行时 fps 保持在 minFPS 和 masFPS 之间 |
| autoFPS | boolean | **默认值:** false, 控制开启动态 fps, 开启后, 会根据 cpu 效率动态提升和降低 fps |
| maxResolutionLevel | number | **默认值:** pc端为4, 手机端为2。 GPU性能不够的机型建议下降此值。 |
| transactionBgColor | string &#124; number | **默认值:** 0x000000, 设置切页动画的背景色, 接受 css 颜色字符串或者 16进制颜色值("#ffffff",0xffffff) |
| forceCanvas | boolean | **默认值:** false, 是否强制使用 2D 渲染，强制使用 2D 渲染会失去部分 3D、滤镜和效果 |
| transitionResolutionLevel | number | **默认值:** pc端为4, 手机端为2。 切页动画截图分辨率等级 |
| antialias | boolean | **默认值:** undefined, 是否开启抗锯齿 |


maxResolutionLevel 取值解释:
0. 640*360
1. 960*540
2. 1280*720
3. 1920*1080
4. 3200*1800


### SLIDE_EVENTS 事件说明

`@netless/slide` 导出 `SLIDE_EVENTS` 对象，包含所有可用的事件类型：

| 事件名 | 说明 |
|--------|------|
| syncDispatch | 同步事件派发，在互动模式和同步模式下触发 |
| syncReceive | 同步事件接收，用于接收来自其他客户端的同步事件 |
| syncEventLag | 仅在同步模式下触发，表示同步消息延迟需要全量同步 |
| renderStart | 当前 slide 开始渲染时触发 |
| renderEnd | 当前 slide 渲染完成时触发 |
| renderError | 当前 slide 渲染错误时触发 |
| slideChange | 页码变化时触发 |
| mainSeqStepStart | 主序列动画开始时触发 |
| mainSeqStepEnd | 主序列动画结束时触发 |
| animateStart | 任意动画开始时触发 |
| animateEnd | 任意动画结束时触发 |
| stateChange | slide 状态变化时触发 |
| slideStepEnd | ppt 没有下一步动作时触发 |
| slideStepStart | ppt 没有上一步动作时触发 |
| useraddLink | 用户点击元素时触发（仅在 addLink 模式下） |


### 互动模式

互动模式下, 各个客户端都可以自由操作 ppt. 与同步模式一样, `@netless/slide` 库通过事件将各个客户端的操作通知给 `@netless/slide` 的调用方, 调用方负责将这些事件传递给所有客户端(包括自己). 与同步模式不同的是, 互动模式下, 发送事件的客户端也同时需要处理接收事件.

要使用互动模式需要将上述的 `mode` 参数设置为 `"interactive"`.

```javascript
// client A
slideA.on(SLIDE_EVENTS.syncDispatch, (event) => {
    // event 为可序列化的 js 对象, 你无需关心 event 具体信息
    // 需要将序列化后的 event 广播给所有参与互动的客户端(包括 slideA 自己)
    socket.boardcast("slide-sync", JSON.stringify(event));
});
// 与同步模式不同, 互动模式下, slideA 自己也需要监听来自 socket
// 的事件, 并将事件派发给 slideA 对象.
socket.on("slide-sync", msg => {
    const event = JSON.parse(msg);
    slideA.emit(SLIDE_EVENTS.syncReceive, event);
});

// client B 执行与 clientA 一样的逻辑, 监听 SLIDE_EVENTS.syncDispatch 事件并广播出去
// 同时自己处理来自 socket 的事件
slideB.on(SLIDE_EVENTS.syncDispatch, (event) => {
    socket.boardcast("slide-sync", JSON.stringify(event));
});
socket.on("slide-sync", msg => {
    const event = JSON.parse(msg);
    slideB.emit(SLIDE_EVENTS.syncReceive, event);
});
```

#### 互动模式下的事件模型

互动模式下, 对 slide 对象的任何操作, 都仅以事件的形式通过 `SLIDE_EVENTS.syncDispatch` 事件将要执行的操作派发出去,
直到收到 `SLIDE_EVENTS.syncReceive` 事件才会实际执行操作.

下图描述了互动模式下的同步事件流转流程, 其中每一页 PPT 初始状态为页码 1 动画 1. 以所有事件都要经过服务器后才执行的事件模型运行, 可以保证最终每个客户端的状态都是一致的.

```mermaid
sequenceDiagram
客户端 A->>Socket 服务: 渲染下一页(发消息)
note left of 客户端 A: 页码: 1 动画 1
客户端 B->>Socket 服务: 执行下一步动画(发消息)
note right of 客户端 B: 页码: 1 动画 1
Note over Socket 服务: 服务器以自己收到的顺序派发事件
par Socket 服务 to 客户端 A
    Socket 服务->>客户端 A: 1. 渲染下一页(收消息)
    note left of 客户端 A: 页码: 2 动画 1
    Socket 服务->>客户端 A: 2. 执行下一步(收消息)
    note left of 客户端 A: 页码: 2 动画 2
and Socket 服务 to 客户端 B
    Socket 服务->>客户端 B: 1. 渲染下一页(收消息)
    note right of 客户端 B: 页码: 2 动画 1
    Socket 服务->>客户端 B: 2. 执行下一步(收消息)
    note right of 客户端 B: 页码: 2 动画 2
end
```

如果消息不经过服务端排序及序号添加, 则互动模式下会出现最终状态不一致的问题, 见下图描述:

```mermaid
sequenceDiagram
note left of 客户端 A: (初始状态)页码: 1 动画 1
客户端 A->>客户端 A: 执行渲染下一页
note left of 客户端 A: 页码: 2 动画 1
客户端 A->>Socket 服务: 渲染下一页(发消息)
note right of 客户端 B: (初始状态)页码: 1 动画 1
客户端 B->>客户端 B: 执行下一步动画
note right of 客户端 B: 页码: 1 动画 2
客户端 B->>Socket 服务: 下一步动画(发消息)
Socket 服务-->>客户端 A: 下一步动画(收消息)
Socket 服务-->>客户端 B: 渲染下一页(收消息)
客户端 A->>客户端 A: 执行下一步动画
note left of 客户端 A: 页码: 2 动画 2
客户端 B->>客户端 B: 执行渲染下一页
note right of 客户端 B: 页码: 2 动画 1
```

### 整体同步

在某些情况下, 需要一种机制将客户端 A 的状态一次性整体同步给客户端 B, 而不是通过一条一条事件完成同步。例如: 客户端 B 断线后重新连接至 socket 房间, 此时需要将客户端 A 的当前状态一次性同步给 B.

为此 `@netless/slide` 提供了获取和设置应用整体状态的机制.

```javascript
// 访问 slideState 可以获取 slide 状态快照
const snapshot = slideA.slideState;

// 将 slideB 的状态同步到 slideA 当前状态
slideB.setSlideState(snapshot);

```

在同步模式下, 被同步的客户端 B 可以在断线重连后询问客户端 A 的当前状态, 客户端 A 收到询问后可以使用上述 API 获取状态快照.
但是在互动模式下, 这种询问的机制就不适用了, 互动模式下所有客户端应该共享同一个状态, 要做到这种效果, 可以在某处(一般是 socket 房间信息上)记录这个状态快照, `@netless/slide` 会在状态变更后通知给你，此时可以将最新的状态记录下来.

```javascript
slideA.on(SLIDE_EVENTS.stateChange, snapshot => {
    socket.room.slideState = snapshot;
});

// 客户端 B 重新连接后, 获取房间信息上的状态并设置
socket.on("connect", () => {
    slideB.setSlideState(socket.room.slideState);
});
```

### 竞态处理

在互动模式下, 由于每个客户端都可以独立的与 ppt 交互，因此存在竞态条件。例如, 客户端 A 执行翻到下一页(记为事件 A),与此同时客户端 B 执行切换到下一个动画(记为事件 B). 这两个事件执行的顺序会影响最终的状态(假设执行事件之前, 处于 ppt 第一页的第一个动画):

**A-B:** 先翻页, 再播放下一个动画, 最终状态为第二页的第一个动画  
**B-A:** 先播放下一个动画, 再执行下一页, 最终状态为第二页第 0 个动画

这两个事件都会传递到 socket 服务器。socket 服务器是否是按事件产生的真实时间来下发这两个事件并不重要, 重要的是两个客户端接收事件的顺序必须一致(A-B或者B-A)，如此才能保证两个客户端最终状态一致。因此, 你需要保证参与互动的每个客户端收到的事件顺序是一致的。

## rtc 混音

**注意: `@netless/slide@0.2.9` 版本才开始支持。**

ppt 里设计的音频和视频, 默认是用浏览器的 api 来播放, 如果有 rtc 混音需要可以提供自定义的播放器类来替换掉内置播放器。自定义的播放器需要实现下面的 `RtcAudioClazz` 接口。
```typescript
export interface RtcAudio {
    /**
     * 开始播放音频.
     */
    play(): void;

    /**
     * 暂停音频播放, 且音频当前播放时间不变
     */
    pause(): void;

    /**
     * 当音频对象不再使用时候被调用
     */
    destroy(): void;

    /**
     * 获取音频当前播放时间, 单位为:秒
     */
    get currentTime(): number;
    /**
     * 设置音频当前播放时间, 单位为:秒。需注意, 无论音频是否正在播放, 都需要确保能设置成功。
     * 如果音频暂停状态下, 设置此值, 那么需保证, 下次恢复播放是从此值位置开始播放。
     */
    set currentTime(time: number);

    /**
     * 返回音频是否暂停状态
     */
    get isPaused(): boolean;

    /**
     * 返回音频时长
     */
    get duration(): number;

    /**
     * 当音频加载完成时触发, 例如: 音频 meta 数据加载完成, 这时候知道了音频实际时长, 就需要触发此事件, 需要保证此事件触发时,
     * 能通过 duration 属性获取到更新后的音频时长
     * @param event
     * @param listener
     */
    on(event: "load", listener: () => void): this;

    /**
     * 当音频暂停时候触发
     * @param event
     * @param listener
     */
    on(event: "pause", listener: () => void): this;

    /**
     * 当音频开始播放时候触发
     * @param event
     * @param listener
     */
    on(event: "play", listener: () => void): this;

    /**
     * 移除参数指定事件的所有监听器
     */
    removeAllListeners(event: string): void;
}

export interface RtcAudioClazz {
    /**
     * 创建 rtc 播放器, url 为音频地址
     * @param url
     */
    new(url: string): RtcAudio;
}
```

js 实现的自定义播放器示例代码可以[参考](./src/RtcAudioPlayer.js)。将自定义的播放器类传递给 `Slide` 的构造函数, 即可替换默认的音频播放器。
```typescript
import { Slide } from "@netless/slide";

const slide = new Slide({
    anchor: someDivElement,
    interactive: true,
    mode: "local",
    rtcAudio: RtcAudioPlayer,
});
```

对于 mp3 文件, `@netless/slide` 直接调用自定义的播放器播放音频。

对于 mp4 文件, 转码服务已经将 mp4 的音频单独提取出一个 mp3 文件, `@netless/slide` 将 mp4 静音, 同时用提供的自定义播放器播放对应的 mp3。

## 错误处理与日志

`@netless/slide@0.3.3` 版本开始, 会捕获当前页面的所有错误, 并通过 `SLIDE_EVENTS.renderError` 事件通知出来,
你可以在此事件的回调函数里跳转到下一页.

### 错误类型说明

`@netless/slide` 导出有 `ErrorType` 枚举类型, 指示了 `SLIDE_EVENTS.renderError` 事件对应的错误类型，说明如下

|  名称   | 触发时机  | 恢复手段 |
|  ----  | ----  | ---         |
| ResourceError | 在 ppt 依赖的远程资源(json,png)不可用时触发, 触发后当前页无法交互 | 重新渲染当前页或者跳转下一页  |
| RuntimeError | 未知的异常， 触发后当前页无法交互 | 跳转下一页 |
| RuntimeWarn | 未知的警告， 在动画过程中出现，触发后动画当前帧表现异常，不影响下一帧和页面交互 | 无需特殊处理 |
|CanvasCrash| 由于内存不足，或者 canvas 被意外的移除(没有调用 slide.destroy() 的情况下移除 canvas 元素为意外移除), 触发后 canvas 元素白屏 | 刷新网页(或者销毁 slide 对象然后重新创建) |

```typescript
import { SLIDE_EVENTS, ErrorType } from "@netless/slide";

// SlideError 继承自 Error, 除了 message, stack 等属性外
// 还添加了 errorType 及 errorMsg 属性,
interface SlideError extends Error {
    errorType: ErrorType;
    errorMsg: string;
}

slide.on(SLIDE_EVENTS.renderError, ({error, index}: {error: SlideError, index: number}) => {
    console.log(`第 ${index} 页出错`);
    if (err.errorType === ErrorType.ResourceError) {
        // 跳转到下一页, 可以根据具体需求选择如何恢复, 例如弹窗确认后再做跳转动作
        slide.renderSlide(index + 1);
    } else if (err.errorType === ErrorType.CanvasCrash) {
        // 需要刷新页面
    } else if (err.errorType === ErrorType.RuntimeError) {
        // 跳转到下一页
        slide.renderSlide(index + 1);
    } else if (err.errorType === ErrorType.RuntimeWarn) {
        // 无需特殊处理, 可以记录日志
    }
});
```

#### 通过 message 事件处理错误

`@netless/slide@0.7.1` 版本开始, 还支持通过 window 的 message 事件处理错误. 主要应用于 Android 和 iOS 设备处理错误, native 代码
可以直接在 webview 上监听 window 的 message 事件，获取错误信息，然后通过往 window 上派发 message 事件来恢复 ppt 的画面.

**监听错误**
```typescript
window.addEventListener("message", evt => {
    if (evt.data.type === "@slide/_error_") {
        const { errorType, errorMsg, slideId, slideIndex } = evt.data;
        // errorType 与上述错误类型对应，不同之处只是这里 errorType 是字符串值
        // errorType 可能的类型有
        // "RESOURCE_ERROR" 对应上述 ResourceError
        // "RUNTIME_ERROR"  对应上述 RuntimeError
        // "RUNTIME_WARN"   对应上述 RuntimeWarn
        // "CANVAS_CRASH"   对应上述 CanvasCrash
        
        // slideId    指示 slide 对象的唯一 id, 发送恢复消息时候要用到这个 id
        // slideIndex 指示报错的页码
    }
});
```

**恢复错误**

恢复错误需要向 window 派发 message 事件, 不同的恢复方式代码如下:

1. 跳转到其他页, RESOURCE_ERROR 和 RUNTIME_ERROR 可以用这种方式恢复
```typescript
window.postMessage({
    type: "@slide/_recover_",
    recoverBy: "renderOtherPage",
    slideId: "${slideId}",        // 使用错误消息里告知的 slideId
    payload: {
        slideIndex: "${slideIndex}",  // 指定要跳转到哪一页, 如果想要跳转到下一页可以使用错误消息里告知的报错页码 + 1
    }
}, "*");
```

2. 重新渲染当前页, RESOURCE_ERROR 可以用这种方式恢复
```typescript
window.postMessage({
    type: "@slide/_recover_",
    recoverBy: "reloadCurrentPage",
    slideId: "${slideId}",        // 使用错误消息里告知的 slideId
}, "*");
```

### 日志

#### 逐条获取日志

`@netless/slide@0.3.3` 版本开始, `ISlideConfig` 中添加了可选的 logger 属性, 需要传入一个符合如下接口的对象

```typescript
interface ILogger {
    info?(msg: string): void;
    error?(msg: string): void;
    warn?(msg: string): void;
}
```

如此便可以接收 ppt 运行日志.

```typescript
import { Slide } from "@netless/slide";

const slide = new Slide({
    anchor: someDivElement,
    interactive: true,
    mode: "local",
    logger: {
        info(msg: string) {
            console.log(msg);
        }
    }
});
```

#### 通过 postMessage 获取日志

`@netless/slide@0.7.1` 版本开始, 除了上述逐条获取日志的方式外, 还可以通过 postMessage 的方式以文本的形式获取日志.

1. 在 window 上派发事件, 通知 `@netless/slide` 开始发送日志
```typescript
window.postMessage({
    type: "@slide/_request_log_",
    sessionId: "${sessionId}",  // session 标识
}, "*");
```
2. 通过监听 message 事件, 分块收取日志文本
```typescript
window.addEventListener("message", (evt) => {
   if (evt.data.type === "@slide/_report_log_") {
       console.log(evt.data.index); // 日志当前分块索引
       console.log(evt.data.log);   // 日志文本
       console.log(evt.data.total); // 总分块数量
       console.log(evt.data.sessionId); // "@slide/_request_log_" 事件中的 sessionId
       if (evt.data.index === evt.data.total) {
           // 则日志收取完毕
       }
   }
});
```

## webgl 上限文限制

浏览器一般会限制 webgl 上下文数量在 8 到 16 个之间, 对于 `@netless/slide` 来说, 一个活动的 Slide 实例占用两个上下文, 一个负责 2D 渲染一个负责 3D 渲染.
如果你创建的 Slide 超过了浏览器限制, 那么前面创建的 Slide 将丢失 webgl 上下文, 导致渲染异常.

**活动的 Slide 实例** 即指没有调用过 `slideInstance.frozen()` 方法的实例, 它的 webgl 绘制环境可以正常工作. 如果你想冻结当前 Slide 实例，将 webgl 上下文留给新创建的 Slide 对象, 就可以
调用 `slideInstance.frozen()`, 这个方法会将当前 ppt 画面截图, 并且保存 ppt 状态, 然后销毁 canvas 元素, 并用截到的图片替代 canvas 元素。冻结之后, Slide 对象的任意切页、上(下)一步 等操作都将失效.

调用 `slideInstance.release()` 可以将 Slide 对象从冻结状态恢复.

你需要自己控制活动的 Slide 实例的数量 在 4 到 8 之间, 一般建议 pc 上控制在 8 以下, 移动端控制在 4 以下.

关于控制活动 ppt 的建议:
1. 通过 [Page_Visibility_API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) 监听页面可见性, 在页面不可见的时候, 将 Slide 对象冻结，并在页面恢复的时候将 Slide 解冻.
2. 如果同一个页面内有多个活动 PPT, 可以设置一个固定长度的活动 PPT 队列, 将 当前获取焦点的 Slide 激活并推入队列, 将被挤出队列的 Slide 冻结.

## 本地缓存管理

`@netless/slide` 使用 indexDB 缓存网络资源及临时生成的纹理. `@netless/slide` 不负责缓存数据的清理, 你需要在适当的时候来清理这部分数据.

和清理缓存相关的两个 api, 实例方法 clearSlideCache 和静态方法 clearLocalCache, 前者清理当前 ppt 缓存, 后者清理所有缓存. 需要注意, clearSlideCache 需要在调用 slide.destroy 之前调用, 否则不能完成清理工作.

```typescript
/**
 * 销毁当前 Slide 实例的本地缓存, 需要在 destroy 之前调用。
 */
clearSlideCache(): void;
/**
 * 销毁历史所有本地缓存
 */
static clearLocalCache(): void;
```

### 资源代理

**注意: `@netless/slide@0.4.0` 版本才开始支持。**

从 `@netless/slide@0.4.0` 开始, 你可以在创建 Slide 对象时提供一个 loaderDelegate 对象, 从而代理 Slide 内部所有远程资源, 进而可以实现
资源重定向, 资源鉴权等需求.

loaderDelegate 属性需符合 `ILoaderDelegate` 接口, 需要注意对于媒体资源, 并不能直接返回资源内容, 只能同步的返回重定向后的资源地址.

```typescript
export interface ILoaderDelegate {
    /**
     * 加载 json 资源, 需返回 json 文本
     * @param url 原始资源地址
     */
    loadJson(url: string): Promise<string>;
    /**
     * 加载图片资源, 需返回 Blob 对象
     * @param url 原始资源地址
     */
    loadImage(url: string): Promise<Blob>;
    /**
     * 媒体文件重定向, mp3 和 mp4 资源会调用这个代理函数, 需返回重定向后的 url
     * @param url 原始资源地址
     */
    redirectMedia(url: string): string;
}
```

一个什么也不干的 loaderDelegate 如下所示, 但是你可以对传入的 url 进行加工:

```typescript
import { Slide, ILoaderDelegate } from "@netless/slide"

const delegate: ILoaderDelegate = {
    async loadJson(url: string): Promise<string> {
        const res = await fetch(url);
        return await res.text();
    },
    async loadImage(url: string): Promise<Blob> {
        const res = await fetch(url)
        return await res.blob();
    },
    redirectMedia(url: string): string {
        return url;
    }
}

const slide = new Slide({
    /// ... 其他初始化配置
    loaderDelegate: delegate,
})
```

## 全局事件

### 页面渲染

页面渲染过程指从页面依赖的资源加载知道页面显示完成.

```javascript
window.addEventListener("message", evt => {
    if (evt.data.type === "@slide/_render_start_") {
        console.log(evt.data.taskId); // ppt 转码任务的 taskId
        console.log(`第 ${evt.data.index} 页开始渲染`);
    } else if (evt.data.type === "@slide/_render_end_") {
        console.log(evt.data.taskId); // ppt 转码任务的 taskId
        console.log(`第 ${evt.data.index} 页开始结束`);
    }
});
```

### 离线缓存

离线缓存会将 json、png 格式的资源和运行时生成的 svg 等资源缓存到 indexDB.

```javascript
// 发起离线缓存
// 缓存指定页码  仅在 @netless/slide^1.4.21 版本开始支持
window.postMessage({
    type: "@slide/_preload_slide_",
    taskId: "", // 转码任务的 taskId,
    prefix: "", // 转码任务返回的资源前缀
    pages: [1,2,3,4,5],  // 缓存第 1 2 3 4 5 页
    sessionId: '12345', // 随机传, 用于区分不同的缓存
}, "*");


window.postMessage({
    type: "@slide/_preload_slide_",
    taskId: "",
    prefix: "",
    pages: [1,2,3,5,8,13], // 缓存 1 2 3 5 8 13 页, 可以跳页缓存
    sessionId: "32345",
}, "*");

// 不传 pages 缓存所有页
window.postMessage({
    type: "@slide/_preload_slide_",
    taskId: "",
    prefix: "",
    sessionId: "all", 
}, "*");


// @netless/slide@1.4.4 到 @netless/slide@1.4.21 前版本的缓存方式
// 仅支持缓存所有页
window.postMessage({
    type: "@slide/_preload_slide_",
    taskId: "",
    prefix: "",
    // 不传 sessionId
    // sessionId: "all",
}, "*");

// 监听缓存进度
window.addEventListener("message", evt => {
    if (evt.data.type === "@slide/_preload_slide_progress_") {
        const { sessionId, taskId, progress } = evt.data;
        console.log(sessionId, taskId, progress);
    } else if (evt.data.type === "@slide/_preload_slide_error_") {
        // 缓存出错 转码任务的 taskId
        const { sessionId, taskId, error } = evt.data;
        console.log(sessionId, taskId, error);
    }
});
```

## 更多用法

### 已转换PPT添加自定义`link`

要使用完整功能需2步
1. 在ppt中添加自定义的`link`

    `@netless/slide@1.4.32`以上版本支持 `addlink` 模式, 可以在已转换的 PPT 中添加自定义的 `link` 事件. 并通过监听 `SLIDE_EVENTS.useraddLink` 时间获取用户点击的元素 id.
    ```javascript
    import { Slide, SLIDE_EVENTS } from "@netless/slide";
    
    const slide = new Slide({
        anchor: someDivElement,
        interactive: true,
        mode: "addLink",
        logger: {
            info(msg: string) {
                console.log(msg);
            }
        }
    });
    
    slide.current.on(SLIDE_EVENTS.useraddLink, (taskId: string, pageIndex: number, shapeId: string) => {
        console.log("useraddLink", taskId, pageIndex, shapeId);
    });
    ```
    可以通过`SLIDE_EVENTS.useraddLink`事件获取用户点击的元素的`shapeId`, 通过弹框或其他方式让用户输入使用其他模式渲染时候需要跳转的`link`, 后续传入`slide`内使用
    注意: 这个方法无法覆盖原有的`link`, 只能给无点击事件的元素添加. `addLink`只作为添加自定义`link`的模式, 不应该在多人房间内使用.

2. 将准备好的 `link` 传入 `slide` 内
    同样需要 `@netless/slide@1.4.32`以上版本, 在创建 `slide` 实例时传入 `customLinks`和`navigatorDelegate`即可
    ```typescript
    import { Slide, CustomLink } from "@netless/slide";
    const customLinks: CustomLink[] = [
        {
            "pageIndex": 1,
            "shapeId": "slide-3",
            "link": "random11=1"
        }
    ];
    
    const slide = new Slide({
        anchor: someDivElement,
        interactive: true,
        mode: "interactive", // 按需选择
        // 自定义的 link 信息
        customLinks: customLinks,
        logger: {
            info(msg: string) {
                console.log(msg);
            }
        },
        // 自定义的 link 跳转逻辑
        navigatorDelegate: {
            openUrl(url: string) {
                console.log("open url", url);
            }
        }
    });
    ```
    点击元素后会触发`navigatorDelegate.openUrl`函数, 并传入`url`, 可以根据`url`参数自定义要完成的动作
    

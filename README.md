# netless-slide demo

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

`Slide` 对象创建之后, 下一步需要设置转换后的资源。`taskId` 为一串 hash 字符串代表一次转换任务 id, `prefixUrl` 为一段 url 地址, 指向转换后的资源根路径。这两个参数都可以从 [转码服务的进度查询 api](https://developer.netless.link/server-zh/home/server-conversion) 中获取.

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

|  key   | type  | description |
|  ----  | ----  | ---         |
| resize  | boolean | **默认值:** false <br/> 设置是否根据窗口大小自动调整分辨率。<br/> 默认情况下 ppt 的 css 尺寸会随着 anchor 元素的大小而变化, 但是 canvas 元素的渲染分辨率不会变化。将此值设置为 true, 会使 canvas 的分辨率也跟随缩放比例缩放，这样能获得更好的性能，但是当 anchor 的 css 尺寸太小的情况下，也会导致画面模糊。<br /> 除非遇到性能问题，一般不建议设置为 true 。|
| enableGlobalClick  | boolean |**默认值:** false <br/> 用于控制是否可以通过点击 ppt 画面执行下一步功能。<br /> 建议移动端开启，移动端受限于屏幕尺寸，交互 UI 较小，如果开启此功能会比较方便执行下一步。|
| timestamp  | () => number |**默认值:** Date.now <br/> 此函数用于获取当前时间, 在同步及互动场景下，ppt 内部需要知道当前时间，这个时间对于参与同步(互动)的多个客户端应该是一致的，这个时间越精确，画面同步也越精确。<br />建议通过后端服务，为多个客户端下发相同的时间。|
| renderOptions  | ISlideRenderOptions 对象 | 见下表 |

### ISlideRenderOptions 配置

|  key   | type  | description |
|  ----  | ----  | ---         |
| minFPS | number | **默认值:** 30 <br/> 设置最小 fps, 应用会尽量保证实际 fps 高于此值, 此值越小, cpu 开销越小。 |
| maxFPS | number | **默认值:** 40 <br/> 设置最大 fps, 应用会保证实际 fps 低于此值, 此值越小, cpu 开销越小。 |
| resolution | number | **默认值:** pc 浏览器为 window.devicePixelRatio; 移动端浏览器为 1 。<br/> 设置渲染分辨倍率, 原始 ppt 有自己的像素尺寸，当在 2k 或者 4k 屏幕下，如果按原始 ppt 分辨率显示，画面会比较模糊。可以调整此值，使画面更清晰，同时性能开销也变高。<br /> 建议保持默认值就行，或者固定为 1。 |
| autoResolution | boolean | **默认值:** false, 控制是否根据运行时实际 fps 自动缩放渲染分辨率, 使得运行时 fps 保持在 minFPS 和 masFPS 之间 |
| autoFPS | boolean | **默认值:** false, 控制开启动态 fps, 开启后, 会根据 cpu 效率动态提升和降低 fps |
| transactionBgColor | string &#124; number | **默认值:** 0x000000, 设置切页动画的背景色, 接受 css 颜色字符串或者 16进制颜色值("#ffffff",0xffffff) |

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


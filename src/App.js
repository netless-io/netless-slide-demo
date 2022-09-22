import React, {createRef, useCallback, useState} from "react";
import { Slide, SLIDE_EVENTS } from "@netless/slide";
import './App.css';

function App() {
    const [taskId, setTaskId] = useState("06415a307f2011ec8bdc15d18ec9acc7");
    const [prefixUrl, setPrefixUrl] = useState("https://convertcdn.netless.group/dynamicConvert");

    const contentRef = createRef();

    const startLimitDetect = useCallback(() => {
        setInterval(() => {
            if (contentRef.current) {
                const anchor = document.createElement("div");
                anchor.style.cssText = "width: 100px;height: 100px;margin: 12px";
                contentRef.current.appendChild(anchor);
                const slideObj = new Slide({
                    anchor: anchor,
                    interactive: true,
                    mode: "local",
                    controller: false,
                });
                slideObj.setResource(taskId, prefixUrl);
                slideObj.renderSlide(1);
                slideObj.on(SLIDE_EVENTS.renderError, (err) => {
                    console.log(err);
                    console.log("fjdioasjfoaif")
                });
            }
        }, 1000);
    }, []);

    return (
        <div className="App">
            <div style={{width: "150px", flex: "0 0 auto" }}>
                <button onClick={startLimitDetect}>测试 Slide 最大数量</button>
            </div>
            <div ref={contentRef} className="Content">

            </div>
        </div>
    );
}

export default App;

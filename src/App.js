import { useCallback, useEffect, useRef, useState } from "react";
import { Slide, SLIDE_EVENTS } from "@netless/slide";
import './App.css';

function App() {
    const [mode, setMode] = useState("local");
    const [taskId, setTaskId] = useState("06415a307f2011ec8bdc15d18ec9acc7");
    const [prefixUrl, setPrefixUrl] = useState("https://convertcdn.netless.group/dynamicConvert");

    const anchorA = useRef(null);
    const slideA = useRef(null);
    const slideB = useRef(null);
    const anchorB = useRef(null);

    const updateTaskId = useCallback((event) => {
        setTaskId(event.target.value);
        localStorage.setItem("slide-taskId", event.target.value);
    }, []);

    const updatePrefix = useCallback((event) => {
        setPrefixUrl(event.target.value);
        localStorage.setItem("slide-prefix", event.target.value);
    }, []);

    const updateMode = useCallback((event) => {
        setMode(event.target.value);
        localStorage.setItem("slide-mode", event.target.value);
    }, []);

    useEffect(() => {
        const mode = localStorage.getItem("slide-mode");
        const taskId = localStorage.getItem("slide-taskId");
        const prefix = localStorage.getItem("slide-prefix");
        if (mode) {
            setMode(mode);
        }
        if (taskId) {
            setTaskId(taskId);
        }
        if (prefix) {
            setPrefixUrl(prefix);
        }
    }, []);

    useEffect(() => {
        if (anchorA.current) {
            slideA.current = new Slide({
                anchor: anchorA.current,
                interactive: true,
                mode: mode,
                controller: true,
            });
            slideA.current.on(SLIDE_EVENTS.stateChange, (s) => {
                console.log(s);
            });
            if (mode === "sync") {
                slideA.current.on(SLIDE_EVENTS.syncDispatch, (e) => {
                    if (slideB.current) {
                        slideB.current.emit(SLIDE_EVENTS.syncReceive, e);
                    }
                });
            } else if (mode === "interactive") {
                slideA.current.on(SLIDE_EVENTS.syncDispatch, (e) => {
                    slideA.current.emit(SLIDE_EVENTS.syncReceive, e);
                    if (slideB.current) {
                        slideB.current.emit(SLIDE_EVENTS.syncReceive, e);
                    }
                });
            }
            slideA.current.setResource(taskId, prefixUrl);
            slideA.current.renderSlide(1);
        }
        return () => {
            slideA.current?.destroy();
        };
    }, [taskId, prefixUrl, mode]);

    useEffect(() => {
        if (mode === "sync" || mode === "interactive") {
            slideB.current = new Slide({
                anchor: anchorB.current,
                interactive: mode !== "sync",
                mode: mode,
                controller: true,
            });
            if (mode === "interactive") {
                slideB.current.on(SLIDE_EVENTS.syncDispatch, (e) => {
                    slideB.current.emit(SLIDE_EVENTS.syncReceive, e);
                    if (slideA.current) {
                        slideA.current.emit(SLIDE_EVENTS.syncReceive, e);
                    }
                });
            }
            slideB.current.setResource(taskId, prefixUrl);
            slideB.current.renderSlide(1);
        }
        return () => {
            slideB.current?.destroy();
        };
    }, [mode, taskId, prefixUrl]);

    return (
        <div className="App">
            <div className={"header"}>
                <div>
                    <label>taskId:</label>
                    <input value={taskId} onChange={updateTaskId}/>
                    <label>prefixUrl:</label>
                    <input value={prefixUrl} onChange={updatePrefix}/>
                </div>
                <select value={mode} onChange={updateMode}>
                    <option value={"local"}>本地模式</option>
                    {/*<option value={"sync"}>同步模式</option>*/}
                    <option value={"interactive"}>互动模式</option>
                </select>
            </div>
            <div className={"content"}>
                <div className={"anchor"} ref={anchorA} style={{width: mode !== "local" ? "45%" : "90%"}}>
                    <div onClick={() => slideA.current?.prevStep()} className={"arrow"} style={{left: "0"}}>{"<"}</div>
                    <div onClick={() => slideA.current?.nextStep()} className={"arrow"} style={{right: "0"}}>{">"}</div>
                </div>
                <div className={"anchor"} ref={anchorB} style={{display: mode !== "local" ? "block" : "none", width: mode !== "local" ? "45%" : "100%"}}>
                    <div onClick={() => slideB.current?.prevStep()} className={"arrow"} style={{left: "0"}}>{"<"}</div>
                    <div onClick={() => slideB.current?.nextStep()} className={"arrow"} style={{right: "0"}}>{">"}</div>
                </div>
            </div>
        </div>
    );
}

export default App;

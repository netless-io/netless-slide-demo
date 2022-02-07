import './App.css';
import {Slide} from "@netless/slide";
import {useEffect, useRef} from "react";

function App() {
    const anchor = useRef(null);
    const slide = useRef(null);

    useEffect(() => {
        if (anchor.current) {
            slide.current = new Slide({
                anchor: anchor.current,
                interactive: true,
                mode: "local",
            });
            slide.current.setResource("06415a307f2011ec8bdc15d18ec9acc7", "https://convertcdn.netless.group/dynamicConvert");
            slide.current.renderSlide(1);
        }
        return () => {
            slide.current?.destroy();
        };
    }, [anchor.current]);

    return (
        <div className="App">
            <div ref={anchor}/>
        </div>
    );
}

export default App;

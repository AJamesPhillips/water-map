
import "./TimeSlider.css"
import { max_time, start_time } from "./utils/time"

interface TimeSliderProps
{
    current_time: number
    set_current_time: (t: number) => void
}

export function TimeSlider(props: TimeSliderProps)
{
    return <div id="time_slider">
        <div id="time_slider_visual_wrapper">
            <div>
                {new Date(2026, 1).toLocaleDateString("en-GB", { year: "numeric" })}&nbsp;
                {new Date(2026, 1).toLocaleDateString("en-GB", { month: "short" })}
            </div>
            <input
                type="range"
                min={start_time}
                max={max_time}
                value={props.current_time}
                className="slider"
                id="myRange"
                onInput={e => props.set_current_time(parseFloat(e.currentTarget.value))}
            />
            <div>
                {new Date(2027, 1).toLocaleDateString("en-GB", { year: "numeric" })}&nbsp;
                {new Date(2027, 1).toLocaleDateString("en-GB", { month: "short" })}
            </div>
        </div>
    </div>
}

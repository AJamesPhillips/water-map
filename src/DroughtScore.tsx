import scale_A from "./assets/scale_A.png"
import scale_B from "./assets/scale_B.png"
import scale_C from "./assets/scale_C.png"
import scale_D from "./assets/scale_D.png"
import scale_E from "./assets/scale_E.png"
import scale_F from "./assets/scale_F.png"
import scale_G from "./assets/scale_G.png"
import "./DroughtScore.css"
import { RegionInfo } from "./interface"


const scale_images = {
    "A": scale_A,
    "B": scale_B,
    "C": scale_C,
    "D": scale_D,
    "E": scale_E,
    "F": scale_F,
    "G": scale_G,
}


export function DroughtScore(props: { zoomed_in: boolean, current_region: RegionInfo, current_time: number })
{
    const { current_region } = props
    const zoomed_in = props.zoomed_in ? "zoomed_in" : "zoomed_out"
    const date = new Date(new Date(2026, 2, 0).getTime() + (props.current_time * 24 * 60 * 60 * 1000))

    const score = water_availability_to_drought_score(current_region.water_availability)

    return <div id="drought_score" className={zoomed_in}>
        <div className="score_box">
            <div>
                <span className="extra_info">
                Water Availability:</span> {current_region.name} <span style={{ fontSize: 18, fontWeight: "bold" }}>
                    {current_region.water_availability}%
                </span>
            </div>
            <div style={{ width: 150 }}>
                <span className="score">{score}</span>
                <img src={scale_images[score]} alt={score} style={{ width: 100, float: "right" }} />
            </div>
            <div className="date_time">
                {date.toLocaleDateString("en-GB", { year: "numeric" })}&nbsp;
                {date.toLocaleDateString("en-GB", { month: "short" })}
            </div>
        </div>
    </div>
}


function water_availability_to_drought_score(water_availability: number)
{
    const steps = 7
    water_availability = Math.round(water_availability / 100 * steps)
    let theshold = steps
    if (water_availability >= theshold--) return "A"
    if (water_availability >= theshold--) return "B"
    if (water_availability >= theshold--) return "C"
    if (water_availability >= theshold--) return "D"
    if (water_availability >= theshold--) return "E"
    if (water_availability >= theshold--) return "F"
    return "G"
}

import "./DroughtScore.css"
import { RegionInfo } from "./interface"
import { asset_url } from "./utils/asset_url"


const scale_images = {
    "A": asset_url("assets/scale_A.png"),
    "B": asset_url("assets/scale_B.png"),
    "C": asset_url("assets/scale_C.png"),
    "D": asset_url("assets/scale_D.png"),
    "E": asset_url("assets/scale_E.png"),
    "F": asset_url("assets/scale_F.png"),
    "G": asset_url("assets/scale_G.png"),
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

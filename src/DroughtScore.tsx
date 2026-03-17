import { useRef, useState } from "preact/hooks"
import "./DroughtScore.css"
import { RegionInfo } from "./interface"
import { Scale } from "./Scale"
// import { asset_url } from "./utils/asset_url"


// const scale_images = {
//     "A": asset_url("assets/scale_A.png"),
//     "B": asset_url("assets/scale_B.png"),
//     "C": asset_url("assets/scale_C.png"),
//     "D": asset_url("assets/scale_D.png"),
//     "E": asset_url("assets/scale_E.png"),
//     "F": asset_url("assets/scale_F.png"),
//     "G": asset_url("assets/scale_G.png"),
// }


export function DroughtScore(props: { zoomed_in: boolean, current_region: RegionInfo, current_time: number })
{
    const { current_region } = props
    const zoomed_in = props.zoomed_in ? "zoomed_in" : "zoomed_out"
    const date = new Date(new Date(2026, 2, 0).getTime() + (props.current_time * 24 * 60 * 60 * 1000))

    const current_time_ref = useRef(props.current_time)
    let current_time_changed = false
    if (props.current_time !== current_time_ref.current)
    {
        current_time_ref.current = props.current_time
        current_time_changed = true
    }

    const target_water_availability = useRef(current_region.water_availability)
    if (current_region.water_availability !== target_water_availability.current)
    {
        target_water_availability.current = current_region.water_availability
    }


    const [display_water_availability, set_display_water_availability] = useState(current_region.water_availability)
    // Animate display_water_availability towards target_water_availability
    if (display_water_availability !== target_water_availability.current)
    {
        const diff = (target_water_availability.current - display_water_availability) / 100
        const step = Math.sign(diff) * Math.min(1, Math.abs(diff)) * 1.2e1
        // debugger
        console.log("target water availability", target_water_availability.current, "display water availability", display_water_availability, "diff", diff, "step", step)
        if (current_time_changed || (Math.abs(diff) < 0.02))
        {
            set_display_water_availability(target_water_availability.current)
        }
        else
        {
            setTimeout(() => set_display_water_availability(display_water_availability + step), 20)
        }
    }


    const score = water_availability_to_drought_score(display_water_availability)


    return <div id="drought_score" className={zoomed_in}>
        <div className="score_box">
            <div>
                <span className="extra_info">
                Water Availability:</span> {current_region.name} <span style={{ fontSize: 18, fontWeight: "bold" }}>
                    {Math.round(display_water_availability)}%
                </span>
            </div>
            <div style={{ width: 150 }}>
                <span className="score">{score}</span>
                {/* <img src={scale_images[score]} alt={score} style={{ width: 100, float: "right" }} /> */}
                <Scale score={display_water_availability / 100} />
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
    water_availability = Math.ceil(water_availability / 100 * steps)
    let theshold = steps
    if (water_availability >= theshold--) return "A"
    if (water_availability >= theshold--) return "B"
    if (water_availability >= theshold--) return "C"
    if (water_availability >= theshold--) return "D"
    if (water_availability >= theshold--) return "E"
    if (water_availability >= theshold--) return "F"
    return "G"
}

/*
function test_water_availability_to_drought_score()
{
    const test_cases = [
        { water_availability: 100, expected_score: "A" },
        { water_availability: 86, expected_score: "A" },
        { water_availability: 85, expected_score: "B" },
        { water_availability: 72, expected_score: "B" },
        { water_availability: 71, expected_score: "C" },
        { water_availability: 58, expected_score: "C" },
        { water_availability: 57, expected_score: "D" },
        { water_availability: 43, expected_score: "D" },
        { water_availability: 42, expected_score: "E" },
        { water_availability: 29, expected_score: "E" },
        { water_availability: 28, expected_score: "F" },
        { water_availability: 15, expected_score: "F" },
        { water_availability: 14, expected_score: "G" },
    ]
    console.log("Testing water_availability_to_drought_score...")
    test_cases.forEach(({ water_availability, expected_score }) =>
    {
        console.assert(water_availability_to_drought_score(water_availability) === expected_score, `Expected ${water_availability_to_drought_score(water_availability)} == ${expected_score} for water availability ${water_availability}`)
    })
}

test_water_availability_to_drought_score()
*/

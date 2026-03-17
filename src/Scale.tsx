
import { deindent } from "../lib/core/src/utils/deindent"
import { clamp } from "./utils/clamp"


const ANGLE_DEG_SEGMENT = 36
function angle_deg_start(int: number)
{
    return 0 - (ANGLE_DEG_SEGMENT * int)
}


const MIN_ANGLE = angle_deg_start(6)
const MAX_ANGLE = angle_deg_start(-1)
const ANGLE_DIFF = MAX_ANGLE - MIN_ANGLE
const MIN_VISUAL_ANGLE = MIN_ANGLE + 5
const MAX_VISUAL_ANGLE = MAX_ANGLE - 5
function angle_arrow_deg(score: number)
{
    // Map 0 to angle_deg_start(6) + 5
    // Map 1 to angle_deg_start(0) - 5
    return clamp(MIN_ANGLE + ANGLE_DIFF * score, MIN_VISUAL_ANGLE, MAX_VISUAL_ANGLE)
}

const arc_args: ArcProps[] = [
    {
        angle_deg_start: angle_deg_start(6),
        colour: { r: 175, g: 85, b: 115 },
        label: "G",
    },
    {
        angle_deg_start: angle_deg_start(5),
        colour: { r: 245, g: 125, b: 50 },
        label: "F",
    },
    {
        angle_deg_start: angle_deg_start(4),
        colour: { r: 250, g: 165, b: 42 },
        label: "E",
    },
    {
        angle_deg_start: angle_deg_start(3),
        colour: { r: 253, g: 217, b: 66 },
        label: "D",
    },
    {
        angle_deg_start: angle_deg_start(2),
        colour: { r: 131, g: 170, b: 79 },
        label: "C",
    },
    {
        angle_deg_start: angle_deg_start(1),
        colour: { r: 48, g: 155, b: 152 },
        label: "B",
    },
    {
        angle_deg_start: angle_deg_start(0),
        colour: { r: 90, g: 135, b: 155 },
        label: "A",
    },
]


export function Scale(props: { score: number })
{
    return <div style={{ width: 100, height: 100, float: "right", overflow: "hidden" }}>
        <svg
            className="scale"
            // style={{ border: "1px solid #000" }}
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
        >
            <defs>
                <filter id="dropShadow" x="0" y="0" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="2" flood-colour="black" flood-opacity="0.5"/>
                </filter>
            </defs>
            <g transform="translate(100 100)">
                {arc_args.map((args, index) => <Arc key={index} {...args} />)}

                <Arrow angle_deg={angle_arrow_deg(props.score)} />
            </g>
        </svg>
    </div>
}



const INNER_RADIUS = 40
const RADIUS_BAND_THIN = 5
const RADIUS_BAND_MAIN = 30

interface ArcProps
{
    angle_deg_start: number
    colour: { r: number, g: number, b: number }
    label: string
}
function Arc(props: ArcProps)
{
    const { angle_deg_start, colour, label } = props
    const fill_light = `rgb(${lighter(colour.r)}, ${lighter(colour.g)}, ${lighter(colour.b)})`
    const fill_main = `rgb(${colour.r}, ${colour.g}, ${colour.b})`

    const arc1_args: ArcPathArgs = {
        start_radius: INNER_RADIUS,
        diff_radius: (RADIUS_BAND_THIN * 2) + RADIUS_BAND_MAIN,
        angle_deg_start,
        angle_deg: ANGLE_DEG_SEGMENT,
    }
    const arc2_args: ArcPathArgs = {
        ...arc1_args,
        start_radius: arc1_args.start_radius + RADIUS_BAND_THIN,
        diff_radius: RADIUS_BAND_MAIN,
    }

    const text_radius = arc1_args.start_radius + (arc1_args.diff_radius * 0.5)
    const text_angle_deg = angle_deg_start + (ANGLE_DEG_SEGMENT / 2)
    const text_angle_rads = text_angle_deg * Math.PI / 180

    const text_x = text_radius * Math.cos(text_angle_rads)
    const text_y = text_radius * Math.sin(text_angle_rads)

    return <>
        <path d={arc_path(arc1_args)} fill={fill_light} filter="url(#dropShadow)" />
        <path d={arc_path(arc2_args)} fill={fill_main} />
        <text x={text_x} y={text_y + 5} text-anchor="middle" font-size="12" fill="#000">{label}</text>
    </>
}


function lighter(value: number)
{
    return Math.round(value + (255 - value) * 0.5)
}


interface ArcPathArgs
{
    start_radius: number
    diff_radius: number
    angle_deg_start: number
    angle_deg: number
}
function arc_path(args: ArcPathArgs)
{
    const { start_radius, diff_radius, angle_deg_start, angle_deg } = args

    const inner_radius = start_radius
    const outer_radius = start_radius + diff_radius

    const cx = 0
    const cy = 0

    const start = (angle_deg_start * Math.PI / 180)
    const end = start + (angle_deg * Math.PI / 180)

    const largeArc = angle_deg > 180 ? 1 : 0

    const x1 = cx + outer_radius * Math.cos(start)
    const y1 = cy + outer_radius * Math.sin(start)

    const x2 = cx + outer_radius * Math.cos(end)
    const y2 = cy + outer_radius * Math.sin(end)

    const x3 = cx + inner_radius * Math.cos(end)
    const y3 = cy + inner_radius * Math.sin(end)

    const x4 = cx + inner_radius * Math.cos(start)
    const y4 = cy + inner_radius * Math.sin(start)

    return deindent(`
        M ${x1} ${y1}
        A ${outer_radius} ${outer_radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${inner_radius} ${inner_radius} 0 ${largeArc} 0 ${x4} ${y4}
        Z
    `)
}


const ARROW_LENGTH = INNER_RADIUS + RADIUS_BAND_THIN
function Arrow(props: { angle_deg: number })
{
    const angle_rad = props.angle_deg * Math.PI / 180
    const x = ARROW_LENGTH * Math.cos(angle_rad)
    const y = ARROW_LENGTH * Math.sin(angle_rad)

    // Arrow head triangle points
    const arrow_x = x * 1.1
    const arrow_y = y * 1.1

    const head_length = 10
    const head_angle_rad = 25 * Math.PI / 180

    const left_x = arrow_x - head_length * Math.cos(angle_rad - head_angle_rad)
    const left_y = arrow_y - head_length * Math.sin(angle_rad - head_angle_rad)

    const right_x = arrow_x - head_length * Math.cos(angle_rad + head_angle_rad)
    const right_y = arrow_y - head_length * Math.sin(angle_rad + head_angle_rad)

    return <>
        <line x1="0" y1="0" x2={x} y2={y} stroke="#000" stroke-width="2"/>
        <polygon points={`${arrow_x},${arrow_y} ${left_x},${left_y} ${right_x},${right_y}`} fill="#000" />
    </>
}


import { useCallback, useState } from "preact/hooks"
import "./Disclaimer.css"


export function Disclaimer()
{
    const [disclaimer_shown, set_disclaimer_shown] = useState(boolean_cookie("disclaimer_shown"))

    const on_click = useCallback(() =>
    {
        set_disclaimer_shown(true)
        document.cookie = "disclaimer_shown=true; max-age=31536000"   // 1 year
    }, [])


    return <div className={"disclaimer " + (disclaimer_shown ? "hidden" : "")}>
        {!disclaimer_shown && <div className="disclaimer-background" onPointerDown={on_click}/>}

        <div></div>
        <div
            className="disclaimer-text"
            onPointerDown={on_click}
        >
            <h2>Please note!</h2>

            <p>
                This is a demo and uses simulated data.  This is <b>not the actual
                water availability</b> for these regions.
            </p>
            <p>
                Also note that only the Severn river basin around Bristol has been split
                into catchments.
            </p>

            <button onClick={on_click}>
                Got it!
            </button>
        </div>
        <div></div>
    </div>
}


function boolean_cookie(name: string)
{
    const cookies = document.cookie.split(";").map(cookie => cookie.trim())
    const match = cookies.find(cookie => cookie.startsWith(name + "="))
    if (!match) return undefined

    const value = match.substring(name.length + 1).toLowerCase()
    if (value === "true") return true
    if (value === "false") return false
    return undefined
}

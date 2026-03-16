import { Regions } from "../../interface"


export interface ZoomBounds
{
    minX: number
    maxX: number
    minY: number
    maxY: number
}

export interface PublishableEvents
{
    hovered_region: Regions | null
    // pointer_down: { region: Regions | null }
    zoom_to_bounds: ZoomBounds
}

import { RegionInfo, Regions } from "../interface"


export const start_time = 0
export const max_time = 365



export function mutate_region_water_availability(regions: {[name in Regions]: RegionInfo}, current_time: number)
{
    for (const region of Object.values(regions))
    {
        if (!region.water_availability_) continue
        const { start, mid, end } = region.water_availability_
        // Change region.water_availability smoothly using a bezier curve between start, mid,
        // and end as current_time goes from start_time to max_time, looping back
        // to start_time after max_time
        const t = (current_time - start_time) / max_time
        const t_clamped = Math.max(0, Math.min(1, t))
        const bezier = (1 - t_clamped) ** 2 * start + 2 * (1 - t_clamped) * t_clamped * mid + t_clamped ** 2 * end
        region.water_availability = Math.round(bezier)
    }
}

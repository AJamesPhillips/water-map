import * as THREE from "three";


// Dark blue: #003366,
// Light blue: #aabed5,
// Light tan: #F5DEB3
export function water_to_drought_color(t: number): THREE.Color
{
    // Clamp t between 0 and 1
    t = Math.max(0, Math.min(100, t)) / 100;

    const colours = [
        "#ffffff",
        // "#eadcc3",
        // "#cbb89a",
        "#7ea8ff",
        // "#3f7ea6",
        "#1e4b7a",
        // "#0b1f3a",
    ]

    // Linearly interpolate between the two nearest colours
    const scaled_t = t * (colours.length - 1)
    const idx = Math.floor(scaled_t)
    const lerp_t = scaled_t - idx

    const c1 = new THREE.Color(colours[idx])
    const c2 = new THREE.Color(colours[Math.min(idx + 1, colours.length - 1)])

    return c1.clone().lerp(c2, lerp_t)
}

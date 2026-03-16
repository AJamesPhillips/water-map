import type { FeatureCollection } from "geojson"
import { useEffect, useRef, useState } from "preact/hooks"
import * as THREE from "three"
import { Line2 } from "three/addons/lines/Line2.js"
import { LineGeometry } from "three/addons/lines/LineGeometry.js"
import { LineMaterial } from "three/addons/lines/LineMaterial.js"

import "./DrawGeom.css"
import { LatLonScale, RegionInfo, Regions, SceneData } from "./interface"
import { regions } from "./regions"
import { water_to_drought_color } from "./utils/colour_scales"
import { collect_rings } from "./utils/geojson/collect_rings"
import { Ring } from "./utils/geojson/interface"
import { is_on_touch_device } from "./utils/is_on_touch_device"
import pub_sub from "./utils/pub_sub"


const on_touch_device = is_on_touch_device()

// ---------------------------------------------------------------------------
// GeoJSON helpers
// ---------------------------------------------------------------------------

/** Return [minLng, minLat, maxLng, maxLat] over all rings. */
function compute_bbox(rings: { outer: Ring; holes: Ring[] }[]): [number, number, number, number]
{
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
    const visit = ([lng, lat]: [number, number]) =>
    {
        if (lng < minLng) minLng = lng
        if (lat < minLat) minLat = lat
        if (lng > maxLng) maxLng = lng
        if (lat > maxLat) maxLat = lat
    }
    for (const { outer, holes } of rings)
    {
        outer.forEach(visit)
        holes.forEach(h => h.forEach(visit))
    }
    return [minLng, minLat, maxLng, maxLat]
}

/** Project geographic coordinates to centred Three.js Vector2s. */
function project_ring(ring: Ring, scale: LatLonScale): THREE.Vector2[]
{
    return ring.map(([lng, lat]) => new THREE.Vector2((lng - scale.mid_lng) * scale.scale_x, (lat - scale.mid_lat) * scale.scale_y))
}


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type DemoGeomProps =
{
    scene_data: SceneData | null
    region_info: RegionInfo
    zoom_target: Regions
    current_time: number
} & ({
    set_scale: (scale: LatLonScale) => void
    scale?: never
} | {
    set_scale?: never
    scale: LatLonScale
})

type MeshList = { mesh: THREE.Mesh; outer_line: Line2 | undefined }[]

export function DemoGeom(props: DemoGeomProps)
{
    const { scene_data, region_info } = props
    if (!scene_data) return null
    const { dpr, camera, scene, renderer, width, height, half_h } = scene_data

    const [geojson, set_geojson] = useState<FeatureCollection | null>(null)
    const [geojson_error, set_geojson_error] = useState<string | null>(null)
    const [_region_is_hovered, set_region_is_hovered] = useState(false)
    const region_is_selected = props.region_info.id === props.zoom_target

    const zoom_target_region = regions[props.zoom_target]
    const should_be_visible = props.region_info.z <= (zoom_target_region.z + 1)

    const computed_scale_ref = useRef<LatLonScale | null>(null)
    const mesh_list_ref = useRef<MeshList>([])

    if (geojson_error) console.error(geojson_error)

    // Fetch GeoJSON once on mount
    useEffect(() =>
    {
        fetch(region_info.file_path)
            .then(res =>
            {
                if (!res.ok) throw new Error("Failed to load GeoJSON: " + region_info.file_path)

                return res.json()
            })
            .then(set_geojson)
            .catch(err => set_geojson_error(err.message))
    }, [])

    // Build / rebuild the Three.js scene whenever the GeoJSON arrives
    useEffect(() =>
    {
        if (!geojson) return
        // --- Project GeoJSON to scene coordinates ---
        const rings = collect_rings(geojson)

        const scale = compute_or_use_scale(props, rings, half_h)
        computed_scale_ref.current = scale

        // --- Project center to canvas coordinates for label ---
        const center_x = region_info.text_position_x ?? 0 * scale.scale_x
        const center_y = region_info.text_position_y ?? 0 * scale.scale_y
        const centerVec = new THREE.Vector3(center_x, center_y, 0)
        centerVec.project(camera)

        // --- Shared materials ---
        // const normal_colour = 0xaabed5
        const normal_colour = water_to_drought_color(region_info.water_availability)
        // const selected_colour = 0x7aaef5
        const fill_mat = new THREE.MeshBasicMaterial({
            color: normal_colour,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 1,
        })

        const edge_mat = new LineMaterial({
            color: NORMAL_OUTLINE_COLOUR,
            linewidth: 2.5,           // screen-space pixels
            resolution: new THREE.Vector2(width * dpr, height * dpr),
        })

        const geo_disposables: THREE.BufferGeometry[] = []
        const mesh_list: { mesh: THREE.Mesh; outer_line: Line2 | undefined }[] = []

        const add_outline = (ring: Ring) =>
        {
            const pts = project_ring(ring, scale)
            if (pts.length === 0) return
            pts.push(pts[0]!)   // close the loop
            const positions: number[] = []
            // Use region_info.z for Z position
            const z = region_info.z ?? 0.002
            for (const v of pts) positions.push(v.x, v.y, z)
            const geo = new LineGeometry()
            geo.setPositions(positions)
            geo_disposables.push(geo)
            const line = new Line2(geo, edge_mat)
            line.position.z = z
            scene.add(line)

            return line
        }

        for (const { outer, holes } of rings)
        {
            if (outer.length < 3) continue

            // Filled polygon (ShapeGeometry uses earcut internally)
            const shape = new THREE.Shape(project_ring(outer, scale))
            for (const hole of holes)
            {
                if (hole.length >= 3)
                {
                    shape.holes.push(new THREE.Path(project_ring(hole, scale)))
                }
            }
            const shape_geo = new THREE.ShapeGeometry(shape)
            geo_disposables.push(shape_geo)
            const mesh = new THREE.Mesh(shape_geo, fill_mat.clone())
            // Use region_info.z for Z position
            const z = region_info.z
            mesh.position.z = z
            mesh.userData.region_id = region_info.id
            scene.add(mesh)

            // Thick outline for outer ring and any holes
            const outer_line = add_outline(outer)
            // If used, then also need to dispose of?
            // holes.forEach(add_outline)

            mesh_list.push({
                mesh,
                outer_line,
            })
        }


        mesh_list_ref.current = mesh_list
        // Apply initial visibility
        mesh_list.forEach(m =>
        {
            m.mesh.visible = should_be_visible
            if (m.outer_line) m.outer_line.visible = should_be_visible
        })

        // Listen for hover events
        const unsub_hovered_region = pub_sub.sub("hovered_region", (region_id: Regions | null) =>
        {
            if (on_touch_device) return   // Don't do hover effects on touch devices

            const matched = region_id === props.region_info.id
            set_region_outline_highlighted(matched, props.region_info, mesh_list)
            set_region_is_hovered(matched)
        })

        // --- Cleanup ---
        return () =>
        {
            mesh_list_ref.current = []
            geo_disposables.forEach(g => g.dispose())
            mesh_list.forEach(m => m.mesh.geometry.dispose())
            mesh_list.forEach(m => m.outer_line?.geometry.dispose())
            fill_mat.dispose()
            edge_mat.dispose()
            renderer.dispose()
            unsub_hovered_region()
        }
    }, [geojson])


    // Toggle mesh visibility when the zoom target changes
    useEffect(() =>
    {
        mesh_list_ref.current.forEach(m =>
        {
            m.mesh.visible = should_be_visible
            if (m.outer_line) m.outer_line.visible = should_be_visible
        })
    }, [should_be_visible])


    // Publish projected bounding box of this region whenever it becomes selected
    useEffect(() =>
    {
        if (!region_is_selected || !geojson) return
        const scale = computed_scale_ref.current
        if (!scale) return

        const rings = collect_rings(geojson)
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        for (const { outer } of rings)
        {
            for (const v of project_ring(outer, scale))
            {
                if (v.x < minX) minX = v.x
                if (v.x > maxX) maxX = v.x
                if (v.y < minY) minY = v.y
                if (v.y > maxY) maxY = v.y
            }
        }
        pub_sub.pub("zoom_to_bounds", { minX, maxX, minY, maxY })
    }, [region_is_selected, geojson])


    useEffect(() =>
    {
        if (!on_touch_device) return
        set_region_outline_highlighted(region_is_selected, props.region_info, mesh_list_ref.current)
    }, [region_is_selected])

    // When current_time changes, we want to use the updated water_availability
    // to update the colour of the region
    useEffect(() =>
    {
        const mesh_list = mesh_list_ref.current
        if (mesh_list.length === 0) return

        const normal_colour = water_to_drought_color(region_info.water_availability)

        mesh_list.forEach(m =>
        {
            const mat = m.mesh.material as THREE.MeshBasicMaterial
            mat.color.set(normal_colour)
        })
    }, [props.current_time])

    return <>
        {/* {label_pos && (
            <div
                className={"region " + (region_is_selected ? "is_selected" : "is_unselected")}
                style={{
                    left: label_pos.x,
                    top: label_pos.y,
                    fontSize: region_info.text_size ?? 60,
                }}
            >
                {region_info.water_availability}%
            </div>
        )} */}
    </>
}


type Arg = ({
    set_scale: (scale: LatLonScale) => void
    scale?: never
} | {
    set_scale?: never
    scale: LatLonScale
})
function compute_or_use_scale(
    arg: Arg,
    rings: { outer: Ring; holes: Ring[] }[],
    half_h: number,
): LatLonScale
{
    const { set_scale, scale } = arg
    if (scale) return scale

    const [minLng, minLat, maxLng, maxLat] = compute_bbox(rings)
    const mid_lng = (minLng + maxLng) / 2
    const mid_lat = (minLat + maxLat) / 2
    const scale_x = (half_h * 2 * 0.9) / Math.max(maxLng - minLng, maxLat - minLat)
    const scale_y = scale_x * 1.3

    set_scale({ mid_lng, mid_lat, scale_x, scale_y })

    return {
        mid_lng,
        mid_lat,
        scale_x,
        scale_y,
    }
}


const NORMAL_OUTLINE_COLOUR = 0x339955
const SELECTED_OUTLINE_COLOUR = 0x55ff77

function set_region_outline_highlighted(highlighted: boolean, region_info: RegionInfo, mesh_list: MeshList)
{
    if (highlighted)
    {
        mesh_list.forEach(m =>
        {
            // (m.mesh.material as THREE.MeshBasicMaterial).color.set(selected_colour)
            if (!m.outer_line) return
            m.outer_line.position.z = region_info.z + 0.1
            m.outer_line.material.color.set(SELECTED_OUTLINE_COLOUR)
        })
    }
    else
    {
        mesh_list.forEach(m =>
        {
            // (m.mesh.material as THREE.MeshBasicMaterial).color.set(normal_colour)
            if (!m.outer_line) return
            m.outer_line.position.z = region_info.z
            m.outer_line.material.color.set(NORMAL_OUTLINE_COLOUR)
        })
    }
}

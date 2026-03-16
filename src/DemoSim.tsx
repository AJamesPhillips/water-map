import { StateUpdater, useEffect, useRef, useState } from "preact/hooks"
import * as THREE from "three"

// import { request_historical_data_components, RequestDataComponentsReturn } from "core/data/fetch_from_db"
// import { format_data_component_value_to_string } from "core/data/format/format_data_component_value_to_string"
// import { IdAndVersion } from "core/data/id"
// import { get_supabase } from "core/supabase/browser"

import "./DemoSim.css"
import { Disclaimer } from "./Disclaimer"
import { DemoGeom } from "./DrawGeom"
import { DroughtScore } from "./DroughtScore"
import { LatLonScale, Regions, SceneData } from "./interface"
import { parent_of_region, regions, river_basins_and_catchments } from "./regions"
import { TimeSlider } from "./TimeSlider"
import pub_sub from "./utils/pub_sub"
import { mutate_region_water_availability } from "./utils/time"


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------


export function DemoSim()
{
    const canvas_ref = useRef<HTMLCanvasElement>(null)
    const [scene_data, set_scene_data] = useState<SceneData | null>(null)
    const [scale, set_scale] = useState<LatLonScale | null>(null)

    const [zoom_target, set_zoom_target] = useState<Regions>("england")
    const [current_time, set_current_time] = useState(0)

    mutate_region_water_availability(regions, current_time)

    // Target frustum for smooth camera animation
    const camera_target_ref = useRef<{ left: number; right: number; top: number; bottom: number } | null>(null)

    useEffect(() =>
    {
        if (!canvas_ref.current) return
        const canvas = canvas_ref.current

        // --- Renderer ---
        const dpr = window.devicePixelRatio
        const width = canvas.offsetWidth
        const height = canvas.offsetHeight
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setPixelRatio(dpr)
        renderer.setSize(width, height, false)   // false = don't override CSS

        // --- Scene + camera ---
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xfafaff)

        const aspect = width / height
        const half_h = 8
        const camera = new THREE.OrthographicCamera(
            -half_h * aspect, half_h * aspect,
            half_h, -half_h,
            0.1, 100,
        )
        camera.position.z = 10

        // Initialise camera target to match starting frustum
        camera_target_ref.current = {
            left: -half_h * aspect,
            right: half_h * aspect,
            top: half_h,
            bottom: -half_h,
        }

        // --- Render loop ---
        let anim_id: number
        const animate = () =>
        {
            anim_id = requestAnimationFrame(animate)

            // Smoothly lerp orthographic frustum toward the current target
            const target = camera_target_ref.current
            if (target)
            {
                const k = 0.08
                camera.left   += (target.left   - camera.left)   * k
                camera.right  += (target.right  - camera.right)  * k
                camera.top    += (target.top    - camera.top)    * k
                camera.bottom += (target.bottom - camera.bottom) * k
                camera.updateProjectionMatrix()
            }

            renderer.render(scene, camera)
        }
        animate()


        set_scene_data({ dpr, canvas: canvas_ref.current, camera, scene, renderer, width, height, aspect, half_h })

        return () =>
        {
            cancelAnimationFrame(anim_id)
            renderer.dispose()
        }
    }, [])


    useEffect(() =>
    {
        if (!scene_data) return
        const { aspect } = scene_data

        const unsub = pub_sub.sub("zoom_to_bounds", ({ minX, maxX, minY, maxY }) =>
        {
            const rangeX = maxX - minX
            const rangeY = maxY - minY
            const cx = (minX + maxX) / 2
            const cy = (minY + maxY) / 2
            const padding = 1.2
            // Expand to fit the canvas aspect ratio
            let half_size = Math.max(rangeX / aspect, rangeY) / 2 * padding
            camera_target_ref.current = {
                left:   cx - half_size * aspect,
                right:  cx + half_size * aspect,
                top:    cy + half_size,
                bottom: cy - half_size,
            }
        })

        return unsub
    }, [scene_data])

    useEffect(() =>
    {
        if (!scene_data) return
        const unsub = listen_for_pointer_events(scene_data.canvas, scene_data.camera, scene_data.scene, set_zoom_target)
        return unsub
    }, [scene_data])


    return <>
        <div style={{position: "relative", width: "100%", height: "100%"}}>
            <Disclaimer />

            <canvas ref={canvas_ref} id="scene-3d" />
            <DemoGeom
                scene_data={scene_data}
                region_info={regions.england}
                set_scale={set_scale}
                zoom_target={zoom_target}
                current_time={current_time}
            />
            {scale && river_basins_and_catchments.map(region =>
            <DemoGeom
                key={region.file_path}
                scene_data={scene_data}
                region_info={region}
                scale={scale}
                zoom_target={zoom_target}
                current_time={current_time}
            />)}

            <DroughtScore
                zoomed_in={zoom_target !== "england"}
                current_time={current_time}
                current_region={regions[zoom_target]}
            />

            {/* <div style={{position: "absolute", left: 10, top: 10}}>{current_time}</div> */}

            <TimeSlider
                current_time={current_time}
                set_current_time={set_current_time}
            />
        </div>
    </>
}


// function LoadData()
// {
//     const [response, set_response] = useState<RequestDataComponentsReturn | null>(null)

//     useEffect(() =>
//     {
//         request_historical_data_components(get_supabase, [new IdAndVersion(10, 1)])
//         .then(set_response)
//     }, [])

//     return <div>
//         {response === null && <p>Loading data from WikiSim...</p>}
//         {response && response.error && <p>Error loading data from WikiSim: {response.error.message}</p>}
//         {response && response.data && <>
//             Loaded {response.data.length} data components from WikiSim:
//             <ul>
//                 {response.data.map((component, index) => (
//                     <li key={index}>
//                         <strong>ID:</strong> {component.id.id},
//                         <strong>Version:</strong> {component.id.version},
//                         <strong>Title:</strong> {component.title},
//                         <strong>Value:</strong> {component.result_value},
//                         <strong>Value as text:</strong> {format_data_component_value_to_string(component)}
//                     </li>
//                 ))}
//             </ul>
//         </>}
//     </div>
// }


function listen_for_pointer_events(canvas: HTMLCanvasElement, camera: THREE.Camera, scene: THREE.Scene, set_zoom_target: StateUpdater<Regions>)
{
    let hovering_region_id: string | null = null

    function on_pointer_move(event: MouseEvent)
    {
        const region = region_from_event(canvas, camera, scene, event)
        if (region === null)
        {
            if (hovering_region_id)
            {
                pub_sub.pub("hovered_region", null)
                hovering_region_id = null
            }
            return
        }
        hovering_region_id = region
        pub_sub.pub("hovered_region", region)
    }

    function on_pointer_down(event: MouseEvent)
    {
        const region = region_from_event(canvas, camera, scene, event)
        hovering_region_id = region
        pub_sub.pub("hovered_region", region)

        set_zoom_target(current_region =>
        {
            let new_region = region
            if (current_region === region) new_region = parent_of_region(current_region)
            return new_region ?? "england"
        })
    }

    canvas.addEventListener("pointermove", on_pointer_move)
    canvas.addEventListener("pointerdown", on_pointer_down)

    return () =>
    {
        canvas.removeEventListener("pointermove", on_pointer_move)
        canvas.removeEventListener("pointerdown", on_pointer_down)
    }
}


function region_from_event(canvas: HTMLCanvasElement, camera: THREE.Camera, scene: THREE.Scene, event: MouseEvent): Regions | null
{
    const raycaster = new THREE.Raycaster()

    const rect = canvas.getBoundingClientRect()
    const clientX = (event as PointerEvent).clientX
    const clientY = (event as PointerEvent).clientY
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

    // For debugging pointer event location
    // // Make a sphere in the scene if one does not already exist
    // let sphere = scene.getObjectByName("pointer_sphere") as THREE.Mesh | undefined
    // if (!sphere)
    // {
    //     const geometry = new THREE.SphereGeometry(0.1, 16, 16)
    //     const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    //     sphere = new THREE.Mesh(geometry, material)
    //     sphere.name = "pointer_sphere"
    //     scene.add(sphere)
    // }

    // const simple_plain = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    // const intersect = raycaster.ray.intersectPlane(simple_plain, new THREE.Vector3())
    // if (intersect) sphere.position.copy(intersect.add(new THREE.Vector3(0, 0, 5)))   // Move slightly above the plane to ensure it doesn't block raycasting of regions
    // else sphere.position.set(1000, 1000, 1000)   // Move far away if no intersection, so it doesn't block raycasting of regions


    const all_intersects = raycaster.intersectObjects(scene.children, true)
    const visible_intersects = all_intersects.filter(intersect =>
    {
        let obj: THREE.Object3D | null = intersect.object
        while (obj)
        {
            if (!obj.visible) return false
            obj = obj.parent
        }
        return true
    })

    // Outlines (Line2) share the same z-depth as fill meshes but carry no region_id.
    // Skip them so a tap near a border still resolves to the correct region.
    const first_region_hit = visible_intersects.find(i => i.object.userData.region_id !== undefined)
    const first_hit = first_region_hit?.object as THREE.Mesh | undefined
    return first_hit ? (first_hit.userData.region_id as Regions) : null
}

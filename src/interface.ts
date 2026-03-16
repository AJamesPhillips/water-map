import * as THREE from "three"


export interface SceneData
{
    dpr: number

    canvas: HTMLCanvasElement
    camera: THREE.Camera
    scene: THREE.Scene
    // renderer: THREE.WebGLRenderer

    width: number
    height: number
    half_h: number
    aspect: number
}


export interface RegionInfo
{
    id: Regions
    name: string
    parent_id: Regions | undefined
    file_path: string
    text_position_x?: number
    text_position_y?: number
    text_size?: number
    water_availability: number
    water_availability_: { start: number, mid: number, end: number }
    z: number
}


export interface LatLonScale
{
    mid_lng: number
    mid_lat: number
    scale_x: number
    scale_y: number
}

export type Catchments = "avon_bristol_sns"
    | "avon_bristol_sns_3045"
    | "avon_bristol_sns_3046"
    | "avon_bristol_sns_3281"
    | "avon_bristol_sns_3332"

export type RiverBasins = "anglian"
    | "humber"
    | "north_west"
    | "northumbria"
    | "south_east"
    | "south_west"
    | "severn"
    | "thames"
export type Regions = "england"
    | RiverBasins
    | Catchments

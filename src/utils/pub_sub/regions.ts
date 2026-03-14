import RBD_Anglian_basin_boundary_url from "../../assets/data/RBD_Anglian_basin_boundary.geojson"
import RBD_Humber_basin_boundary_url from "../../assets/data/RBD_Humber_basin_boundary.geojson"
import RBD_North_West_basin_boundary_url from "../../assets/data/RBD_North_West_basin_boundary.geojson"
import RBD_Northumbria_basin_boundary_url from "../../assets/data/RBD_Northumbria_basin_boundary.geojson"
import RBD_Severn_basin_boundary_url from "../../assets/data/RBD_Severn_basin_boundary.geojson"
import RBD_South_East_basin_boundary_url from "../../assets/data/RBD_South_East_basin_boundary.geojson"
import RBD_South_West_basin_boundary_url from "../../assets/data/RBD_South_West_basin_boundary.geojson"
import RBD_Thames_basin_boundary_url from "../../assets/data/RBD_Thames_basin_boundary.geojson"
import avon_bristol_sns_boundary_url from "../../assets/data/catchments_severn/avon_bristol_sns_boundary.geojson"
import OC_3045_boundary_url from "../../assets/data/catchments_severn/catchments_avon_bristol_sns/OC_3045_boundary.geojson"
import OC_3046_boundary_url from "../../assets/data/catchments_severn/catchments_avon_bristol_sns/OC_3046_boundary.geojson"
import OC_3281_boundary_url from "../../assets/data/catchments_severn/catchments_avon_bristol_sns/OC_3281_boundary.geojson"
import OC_3332_boundary_url from "../../assets/data/catchments_severn/catchments_avon_bristol_sns/OC_3332_boundary.geojson"
import england_boundary_url from "../../assets/data/england_boundary.geojson"
import { Catchments, RegionInfo, Regions, RiverBasins } from "../../interface"


// const base_text_size = 60
// const second_text_size = 40
export const river_basin_regions: {[name in RiverBasins]: RegionInfo} = {
    anglian: {
        id: "anglian",
        name: "Anglian",
        parent_id: "england",
        file_path: RBD_Anglian_basin_boundary_url,
        // text_position_x: 2.5,
        // text_position_y: -0.3,
        // text_size: second_text_size,
        water_availability: 64.8,
        water_availability_: { start: 64.8, mid: 19.3, end: 57.3 },
        z: 1,
    },
    humber: {
        id: "humber",
        name: "Humber",
        parent_id: "england",
        file_path: RBD_Humber_basin_boundary_url,
        // text_position_x: 1.2,
        // text_position_y: 0.8,
        // text_size: second_text_size,
        water_availability: 35.6,
        water_availability_: { start: 35.6, mid: 19.3, end: 57.3 },
        z: 1,
    },
    north_west: {
        id: "north_west",
        name: "North West",
        parent_id: "england",
        file_path: RBD_North_West_basin_boundary_url,
        // text_position_x: -0.3,
        // text_position_y: 1,
        // text_size: second_text_size * 0.8,
        water_availability: 42.9,
        water_availability_: { start: 42.9, mid: 23, end: 24 },
        z: 1,
    },
    northumbria: {
        id: "northumbria",
        name: "Northumbria",
        parent_id: "england",
        file_path: RBD_Northumbria_basin_boundary_url,
        // text_position_x: 0.5,
        text_position_y: -0.5,
        // text_size: second_text_size,
        water_availability: 0,
        water_availability_: { start: 0, mid: 38, end: 32 },
        z: 1,
    },
    south_east: {
        id: "south_east",
        name: "South East",
        parent_id: "england",
        file_path: RBD_South_East_basin_boundary_url,
        // text_position_x: 2.5,
        text_position_y: -0.9,
        // text_size: second_text_size * 0.8,
        water_availability: 45.7,
        water_availability_: { start: 45.7, mid: 19.3, end: 57.3 },
        z: 1,
    },
    south_west: {
        id: "south_west",
        name: "South West",
        parent_id: "england",
        file_path: RBD_South_West_basin_boundary_url,
        text_position_x: 1,
        text_position_y: 1.5,
        // text_size: second_text_size,
        water_availability: 100,//53.1,
        water_availability_: { start: 100, mid: 32, end: 92 },
        z: 1,
    },
    severn: {
        id: "severn",
        name: "Severn",
        parent_id: "england",
        file_path: RBD_Severn_basin_boundary_url,
        text_position_x: -1.4,
        text_position_y: 0.7,
        // text_size: second_text_size,
        water_availability: 75.3,
        water_availability_: { start: 75.3, mid: 32, end: 92 },
        z: 1,
    },
    thames: {
        id: "thames",
        name: "Thames",
        parent_id: "england",
        file_path: RBD_Thames_basin_boundary_url,
        // text_position_x: 1.5,
        text_position_y: -1,
        // text_size: second_text_size,
        water_availability: 40.2,
        water_availability_: { start: 40.2, mid: 19.3, end: 57.3 },
        z: 1,
    }
}

const catchments: {[name in Catchments]: RegionInfo} = {
    avon_bristol_sns: {
        id: "avon_bristol_sns",
        name: "Avon Bristol and Somerset North Streams",
        parent_id: "severn",
        file_path: avon_bristol_sns_boundary_url,
        water_availability: 59,
        water_availability_: { start: 59, mid: 32, end: 82 },
        z: 2,
    },
    avon_bristol_sns_3045: {
        id: "avon_bristol_sns_3045",
        name: "Avon Bristol Rural",
        parent_id: "avon_bristol_sns",
        file_path: OC_3045_boundary_url,
        water_availability: 100,
        water_availability_: { start: 100, mid: 37, end: 75 },
        z: 3,
    },
    avon_bristol_sns_3046: {
        id: "avon_bristol_sns_3046",
        name: "Avon Bristol Urban",
        parent_id: "avon_bristol_sns",
        file_path: OC_3046_boundary_url,
        water_availability: 41,
        water_availability_: { start: 41, mid: 23, end: 62 },
        z: 3,
    },
    avon_bristol_sns_3281: {
        id: "avon_bristol_sns_3281",
        name: "Severn Lower Vale",
        parent_id: "avon_bristol_sns",
        file_path: OC_3281_boundary_url,
        water_availability: 0,
        water_availability_: { start: 0, mid: 38, end: 32 },
        z: 3,
    },
    avon_bristol_sns_3332: {
        id: "avon_bristol_sns_3332",
        name: "Somerset North Streams",
        parent_id: "avon_bristol_sns",
        file_path: OC_3332_boundary_url,
        water_availability: 65,
        water_availability_: { start: 65, mid: 32, end: 92 },
        z: 3,
    },
}

export const regions: {[name in Regions]: RegionInfo} = {
    england: {
        id: "england",
        name: "England",
        parent_id: undefined,
        file_path: england_boundary_url,
        text_position_x: 1.1,
        text_position_y: 0,
        // text_size: base_text_size,
        water_availability: 51,
        water_availability_: { start: 51.2, mid: 19.3, end: 57.3 },
        z: 0,
    },
    ...river_basin_regions,
    ...catchments,
}


export const river_basins_and_catchments = Object.values(regions).filter(region => region.id !== "england")

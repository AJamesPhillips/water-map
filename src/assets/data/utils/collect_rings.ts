import { FeatureCollection, Geometry } from "geojson"
import { Ring } from "./interface"


interface CollectedRing
{
    outer: Ring
    holes: Ring[]
}

/** Recursively extract rings from a single Geometry node. */
function collect_rings_from_geometry(geom: Geometry, result: CollectedRing[]): void
{
    if (geom.type === "Polygon")
    {
        result.push({ outer: geom.coordinates[0] as Ring, holes: geom.coordinates.slice(1) as Ring[] })
    }
    else if (geom.type === "MultiPolygon")
    {
        for (const polygon of geom.coordinates)
        {
            result.push({ outer: polygon[0] as Ring, holes: polygon.slice(1) as Ring[] })
        }
    }
    else if (geom.type === "GeometryCollection")
    {
        for (const child of geom.geometries)
        {
            collect_rings_from_geometry(child, result)
        }
    }
}

/** Extract all { outer, holes } polygon rings from a FeatureCollection. */
export function collect_rings(geojson: FeatureCollection): CollectedRing[]
{
    const result: CollectedRing[] = []
    for (const feature of geojson.features)
    {
        if (!feature.geometry) continue
        collect_rings_from_geometry(feature.geometry, result)
    }
    return result
}

import os

import geopandas as gpd
import ipdb
import matplotlib.pyplot as plt
from shapely.geometry import MultiPolygon, Polygon

source = "england"
source = "RBD_Severn_basin"
source = "RBD_North_West_basin"
source = "RBD_Northumbria_basin"
source = "RBD_South_West_basin"
source = "RBD_Thames_basin"
source = "RBD_South_East_basin"
source = "RBD_Anglian_basin"
source = "RBD_Humber_basin"
source = "catchments_severn/avon_bristol_sns"
source = "catchments_severn/catchments_avon_bristol_sns/OC_3045"
source = "catchments_severn/catchments_avon_bristol_sns/OC_3046"
source = "catchments_severn/catchments_avon_bristol_sns/OC_3281"
source = "catchments_severn/catchments_avon_bristol_sns/OC_3332"
INPUT_PATH = os.path.join(os.path.dirname(__file__), '{}.geojson'.format(source))
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '{}_boundary.geojson'.format(source))

# Adjust this tolerance for more/less simplification (in degrees, e.g. 0.01 ~ 1km)
SIMPLIFY_TOLERANCE = 0.005


def drop_holes(geom):
    """Remove all interior holes from a Polygon or MultiPolygon."""
    if geom.geom_type == 'Polygon':
        holes = geom.interiors
        if holes:
            print("Dropping {} holes from Polygon".format(len(holes)))
        return Polygon(geom.exterior)
    elif geom.geom_type == 'MultiPolygon':
        holes = [interior for part in geom.geoms for interior in part.interiors]
        if holes:
            print("Dropping {} holes from MultiPolygon".format(len(holes)))
        return MultiPolygon([Polygon(part.exterior) for part in geom.geoms])
    return geom


def drop_contained_parts(geom):
    """For a MultiPolygon, find the largest part and drop any other parts that
    lie entirely within it (i.e. enclosed islands that appear as separate polygon
    components rather than interior holes).
    """
    if geom.geom_type != 'MultiPolygon':
        return geom

    parts = list(geom.geoms)
    largest = max(parts, key=lambda p: p.area)
    kept = [p for p in parts if p is largest or not p.within(largest)]
    if len(kept) < len(parts):
        print("Dropping {} contained parts from MultiPolygon".format(len(parts) - len(kept)))

    if len(kept) == 1:
        return kept[0]
    return MultiPolygon(kept)


def main():
    print(f"Reading {INPUT_PATH} ...")
    gdf = gpd.read_file(INPUT_PATH)

    rivers_catchments = gdf[
        (gdf['geometry'].geom_type == 'Polygon')
        | (gdf['geometry'].geom_type == 'MultiPolygon')
    ]

    merged_outline = rivers_catchments.union_all()
    merged_outline = drop_holes(merged_outline)

    # Copy the merged outline and simplify it to reduce the number of vertices
    print("Simplifying merged outline ...")
    merged_outline = merged_outline.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)
    merged_outline = drop_holes(merged_outline)

    merged_outline = drop_contained_parts(merged_outline)

    # Save the merged outline to a new GeoJSON file
    merged_outline_gdf = gpd.GeoDataFrame(geometry=[merged_outline], crs=gdf.crs)
    merged_outline_gdf.to_file(OUTPUT_PATH, driver='GeoJSON')
    print(f"Merged outline saved to {OUTPUT_PATH}")

    fig, ax = plt.subplots()

    gpd.GeoSeries([merged_outline]).plot(ax=ax, alpha=0.5, edgecolor='black', facecolor='lightblue')
    ax.set_aspect(1.3)
    plt.title(source)
    plt.show()



if __name__ == "__main__":
    main()

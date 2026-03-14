

directory_name = "RBD_South_West_shapefile"

import os
import geopandas as gpd


def inspect_shapefile(path: str):
    print(f"\n=== {os.path.basename(path)} ===")
    gdf = gpd.read_file(path)
    print(f"  CRS       : {gdf.crs}")
    print(f"  # rows    : {len(gdf)}")
    print(f"  Geom types: {gdf.geom_type.unique().tolist()}")
    print(f"  Columns   : {gdf.columns.tolist()}")
    print(f"  Bounds    : {gdf.total_bounds}")
    if len(gdf) <= 10:
        print(gdf[["geometry"] + [c for c in gdf.columns if c != "geometry"]].to_string())
    else:
        print(gdf.head(3).to_string())


def main():
    shp_files = sorted(
        os.path.join(directory_name, f)
        for f in os.listdir(directory_name)
        if f.endswith(".shp")
    )
    print(f"Found {len(shp_files)} shapefile(s) in '{directory_name}':")
    for p in shp_files:
        print(f"  {os.path.basename(p)}")

    # Focus on the River Basin Districts layer — most likely to hold the overall boundary
    rbd_path = os.path.join(directory_name, "WFD_River_Basin_Districts_Cycle_3.shp")
    if os.path.exists(rbd_path):
        inspect_shapefile(rbd_path)
    else:
        print("\nRiver Basin Districts shapefile not found; inspecting all layers:")
        for p in shp_files:
            inspect_shapefile(p)


if __name__ == "__main__":
    main()

import os

import geopandas as gpd
import matplotlib.image as mpimg
import matplotlib.pyplot as plt

# INPUT_PATH = os.path.join(os.path.dirname(__file__), 'severn_basin.geojson')
INPUT_PATH = os.path.join(os.path.dirname(__file__), 'RBD_Severn_basin_boundary.geojson')


def main():
    print(f"Reading {INPUT_PATH} ...")
    gdf = gpd.read_file(INPUT_PATH)

    # # Select only the features which have properties.'water-body-type'.string == 'River' and geometry.type == 'Polygon'
    # rivers_catchments: gpd.GeoDataFrame = gdf[
    #     (gdf['geometry'].geom_type == 'Polygon')
    #     | (gdf['geometry'].geom_type == 'MultiPolygon')
    # ]

    # merged_outline = rivers_catchments.union_all()
    merged_outline = gdf.geometry[0]

    img = mpimg.imread("RBD_Severn_basin_screenshot_2026_03_09.png")

    # Get bounds of the merged geometry
    minx, miny, maxx, maxy = merged_outline.bounds
    miny -= 0.1
    maxy += 0.09
    minx -= 0.35
    maxx -= 0.1

    fig, ax = plt.subplots()
    # Plot the image behind, matching the geometry bounds
    ax.imshow(img, extent=[minx, maxx, miny, maxy], aspect='equal', zorder=0)

    gpd.GeoSeries([merged_outline]).plot(ax=ax, alpha=0.5)
    ax.set_aspect(1.3)
    plt.title("Plotting the merged outline of Severn river catchments (in dark blue)\non top of the Severn Basin image from\nhttps://environment.data.gov.uk/catchment-planning/RiverBasinDistrict/9")
    plt.show()


if __name__ == "__main__":
    main()

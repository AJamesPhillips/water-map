import requests

# Download the geojson file from https://environment.data.gov.uk/catchment-planning/England.geojson
# and save it to src/data/england.geojson
url = "https://environment.data.gov.uk/catchment-planning/England.geojson"
response = requests.get(url)
if response.status_code == 200:
    with open("./england.geojson", "w") as f:
        f.write(response.text)
else:
    print(f"Failed to download geojson file: {response.status_code}")

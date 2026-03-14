import json
import os

source = "wessex"
INPUT_PATH = os.path.join(os.path.dirname(__file__), '{}.geojson'.format(source))

def main():
    print("Processing reservoir data...")
    data = json.load(open(INPUT_PATH))

    rows = data["features"]

    # Collect data by reservoir ID
    data_by_id = {
        '12033': [],
        '12092': [],
        '12049': [],
        '12062': [],
        '12111': [],
        '11777': [],
        '12004': [],
        '11208': [],
    }

    for row in rows:
        properties = row["properties"]
        id = properties["RESERVOIR_ID"]
        if id in data_by_id:
            print(properties["CURRENT_LEVEL"], properties["CAPACITY"])
            data_by_id[id].append({
                "date": properties["DATE"],
                "percentage": ((properties["CURRENT_LEVEL"] or 0) / properties["CAPACITY"]) * 100,
            })

    print(data_by_id)


if __name__ == "__main__":
    main()

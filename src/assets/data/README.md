
Processing data for the visualisation.

## Setup python env

    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip

## Install dependencies

    pip install -r requirements.txt

## Download geojson data

    python download.py

## Process

Download the different geojson files and extract the boundaries for the visualisation.
Manually change the `source` variable in the script to the correct file name  and run:

    python extract_geojson_boundaries.py

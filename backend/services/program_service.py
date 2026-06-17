import json


def load_programs():

    with open(
        "data/programs.json",
        "r",
        encoding="utf-8"
    ) as f:

        return json.load(f)

"""Optional asset refresh. Normal use needs no Internet; all assets ship in the ZIP."""

import concurrent.futures, json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "data/recipes.json").read_text(encoding="utf-8"))


def fetch(recipe):
    destination = ROOT / recipe["image"]
    if destination.exists() and destination.stat().st_size > 5000:
        return recipe["id"] + ": already local"
    url = recipe["imageSource"] + "?auto=format&fit=crop&w=1000&q=82&fm=jpg"
    request = urllib.request.Request(
        url, headers={"User-Agent": "RecipeNest-Educational-Project/1.0"}
    )
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            payload = response.read()
        if not payload.startswith(b"\xff\xd8"):
            raise ValueError("Expected JPEG")
        destination.write_bytes(payload)
        return recipe["id"] + f": {len(payload)} bytes"
    except Exception as exc:
        return recipe["id"] + ": ERROR " + str(exc)


with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    for result in pool.map(fetch, data["recipes"]):
        print(result, flush=True)
credits = [
    "# RecipeNest asset acknowledgements\n",
    "Food photographs: Unsplash. Images are illustrative and may differ from each recipe. No claim is made that these photographs were created for RecipeNest.\n",
    "Image licence reference: https://unsplash.com/license\n",
    "The original CDN source identifiers below are preserved for each local asset. Photographer names were not supplied by the image endpoint and are not invented.\n",
    "| Recipe | Local file | Original source |\n|---|---|---|",
]
for r in data["recipes"]:
    credits.append(f"| {r['name']} | {r['image']} | {r['imageSource']} |")
credits += [
    "\nInterface design and SVG favicon: original work for this educational project.",
    "\nAngularJS and angular-route 1.8.2: https://code.angularjs.org/1.8.2/ — MIT licence, full notice in vendor/ANGULAR-LICENSE.txt.",
    "\nSample recipes are original educational text. Contributor profiles are fictional.",
]
(ROOT / "assets/CREDITS.md").write_text("\n".join(credits), encoding="utf-8")

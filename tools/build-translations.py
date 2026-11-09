"""Build the offline translation bundle. Run from any folder with Python 3.

Edit ui-translations.txt, common-translations.txt, recipe-translations.txt or
other-content.txt here, then run this script. Column order: key, vi, ja, zh, fr.
The broken-bar character (¦) separates columns; do not use it inside a value.
Hindi uses hindi-translations.txt with source-reference and translation columns.
"""

from pathlib import Path
import json, re, hashlib

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
BASE_LANGUAGES = ("vi", "ja", "zh", "fr")
LANGUAGES = (*BASE_LANGUAGES, "hi")
data = json.loads((ROOT / "data/recipes.json").read_text(encoding="utf-8"))
sources = json.loads((TOOLS / "ui-source.json").read_text(encoding="utf-8"))
dictionaries = {code: {} for code in LANGUAGES}


def add(source, values):
    source = re.sub(r"\s+", " ", source).strip()
    assert source and len(values) == 4 and all(value.strip() for value in values), source
    for code, value in zip(BASE_LANGUAGES, values):
        dictionaries[code][source] = value.strip()


def rows(name):
    for number, line in enumerate((TOOLS / name).read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        cells = line.split("¦")
        assert len(cells) == 5, f"{name}:{number}: expected five columns"
        yield cells[0], cells[1:]


for index, values in rows("ui-translations.txt"):
    if int(index) in (127, 227):
        continue  # Obsolete fragments replaced with complete sentences.
    add(sources[int(index)], values)
for source, values in rows("common-translations.txt"):
    add(source, values)
recipes = {r["id"]: r for r in data["recipes"]}
for key, values in rows("recipe-translations.txt"):
    rid, field = key.split(".", 1)
    source = recipes[rid]["steps"][int(field)] if field.isdigit() else recipes[rid][field]
    add(source, values)
for key, values in rows("other-content.txt"):
    kind, rid, field = key.split(".")
    record = next(
        r
        for r in data["contributors" if kind == "contributor" else "collections"]
        if r["id"] == rid
    )
    add(record[field], values)

# Reference the same English source data without duplicating long source text.
for number, line in enumerate(
    (TOOLS / "hindi-translations.txt").read_text(encoding="utf-8").splitlines(), 1
):
    if not line.strip():
        continue
    cells = line.split("¦")
    assert len(cells) == 2 and cells[1].strip(), f"hindi-translations.txt:{number}"
    kind, key = cells[0].split(":", 1)
    if kind == "ui":
        source = sources[int(key)]
    elif kind == "common":
        source = key
    elif kind == "image":
        source = recipes[key]["imageAlt"]
    elif kind == "recipe":
        rid, field = key.split(".", 1)
        source = recipes[rid]["steps"][int(field)] if field.isdigit() else recipes[rid][field]
    elif kind == "other":
        category, rid, field = key.split(".")
        record = next(
            r
            for r in data["contributors" if category == "contributor" else "collections"]
            if r["id"] == rid
        )
        source = record[field]
    else:
        raise ValueError(f"Unknown Hindi source kind: {kind}")
    source = re.sub(r"\s+", " ", source).strip()
    assert source in dictionaries["vi"], f"Unknown Hindi source: {source}"
    dictionaries["hi"][source] = cells[1].strip()
missing_hindi = set(dictionaries["vi"]) - set(dictionaries["hi"])
assert not missing_hindi, "Missing Hindi translations: " + repr(sorted(missing_hindi))

# Every visible catalogue text has a complete translation, not a silent English fallback.
required = []
for recipe in data["recipes"]:
    required.extend(
        recipe[field] for field in ("name", "description", "notes", "imageAlt", "cuisine", "meal")
    )
    required += recipe["steps"] + recipe["tags"] + recipe["allergens"]
    for ingredient in recipe["ingredients"]:
        required += [ingredient["name"]]
        if ingredient["unit"]:
            required.append(ingredient["unit"])
        if ingredient.get("note"):
            required.append(ingredient["note"])
for record in data["contributors"]:
    required.extend(record[field] for field in ("speciality", "background", "bio"))
    required += record["interests"]
for record in data["collections"]:
    required.extend([record["name"], record["description"]])
for source in required:
    for code in LANGUAGES:
        assert source in dictionaries[code], f"Missing {code}: {source}"
english = {}
# Compact stable keys keep long prose out of HTML expressions and prevent formatters
# from inserting literal line breaks into quoted AngularJS strings.
aliases = {}
for source in list(dictionaries["vi"]):
    if source:
        key = "text." + hashlib.sha1(source.encode("utf-8")).hexdigest()[:12]
        aliases[source] = key
        english[key] = source
        for code in LANGUAGES:
            dictionaries[code][key] = dictionaries[code][source]
bundle = {"en": english, **dictionaries}
out = "/* Generated by tools/build-translations.py. Offline UI and recipe translations. */\n"
out += '(function(root, factory) {\n  if (typeof module === "object" && module.exports) module.exports = factory();\n  else root.RecipeTranslations = factory();\n})(typeof window !== "undefined" ? window : this, function() {\n  return '
out += json.dumps(bundle, ensure_ascii=False, indent=2) + ";\n});\n"
(ROOT / "js/translations.js").write_text(out, encoding="utf-8")
print(f'Built {len(dictionaries["vi"])} entries per added language; all 24 recipes covered.')

import json
from pathlib import Path


FILE_PATH = Path("public/data/studyRecords.json")

# Based on plan: .cursor/plans/plan_mapping_D96-D100_2026-03.md (mini scope)
REQUIRED: dict[str, list[str]] = {
    # D99 (2026-03-30): meo xinh dep
    "2026-03-30": ["49"],
    # D100 (2026-03-31): vu, luxultm, ava, tai tran, bich, serene flow
    "2026-03-31": ["33", "86", "26", "36", "42", "66"],
}


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    # indent=2 để diff rõ ràng; newline cuối file tránh cảnh "No newline at end of file"
    with path.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def ensure_ids_for_day(data: dict, day_key: str, ids: list[str]) -> list[str]:
    if day_key in data and not isinstance(data[day_key], dict):
        raise ValueError(f"Day {day_key} exists but is not a JSON object.")

    if day_key not in data:
        data[day_key] = {}

    missing = [id_str for id_str in ids if id_str not in data[day_key]]

    # Add-only: only set required IDs to true; do not delete anything else.
    for id_str in ids:
        data[day_key][id_str] = True

    return missing


def main() -> None:
    if not FILE_PATH.exists():
        raise FileNotFoundError(f"File not found: {FILE_PATH.resolve()}")

    data = load_json(FILE_PATH)

    total_added = 0
    for day_key in sorted(REQUIRED.keys()):
        missing = ensure_ids_for_day(data, day_key, REQUIRED[day_key])
        if missing:
            print(f"[{day_key}] added_missing: {missing}")
            total_added += len(missing)
        else:
            print(f"[{day_key}] already_ok")

    save_json(FILE_PATH, data)
    print(f"done. total_added={total_added}")


if __name__ == "__main__":
    main()


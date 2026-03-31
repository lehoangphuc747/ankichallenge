import json
from pathlib import Path

FILE_PATH = Path("public/data/studyRecords.json")

# Add-only requirements (generated from .cursor/plans/plan_mapping_D96-D100_2026-03.md)
# - Keys: YYYY-MM-DD
# - Values: list of user ID strings that must be present as { "<id>": true } in that day object.
REQUIRED: dict[str, list[str]] = {
    # D96 (2026-03-27): chauvegas, dulgi + QuangXo
    "2026-03-27": ["46", "52", "14"],

    # D98 (2026-03-29): luxultm, nothin, serene flow, chauvegas, thocao, tai tran,
    #                   wind, johnny l, kirstin, dulgi, andrew, the mink, linh0101, meo xinh dep + QuangXo
    "2026-03-29": ["86", "43", "66", "46", "24", "36", "64", "68", "45", "52", "69", "82", "63", "49", "14"],

    # D99 (2026-03-30): includes endorphin_111 (ID 14) already
    "2026-03-30": [
        "52",
        "68",
        "43",
        "9",
        "36",
        "66",
        "64",
        "38",
        "58",
        "24",
        "30",
        "45",
        "39",
        "32",
        "69",
        "14",
        "26",
        "42",
        "86",
        "46",
        "63",
        "82",
        "37",
        "79",
        "33",
        "34",
    ],

    # D100 (2026-03-31): tram1601, chauvegas, duy sanji, vu + QuangXo
    "2026-03-31": ["34", "46", "37", "33", "14"],

    # Checklist riêng meo xinh dep (ID 49) + QuangXo where requested
    "2026-01-19": ["49"],  # D29 19/01
    "2026-03-06": ["49", "14"],  # D75 06/03 + QuangXo
    "2026-03-12": ["49", "14"],  # D81 12/03 + QuangXo
    "2026-03-15": ["49", "14"],  # D84 15/03 + QuangXo

    # Checklist riêng Quang Xồ / endorphin_111 (ID 14)
    "2026-01-02": ["14"],  # D12 02/01
    "2026-01-14": ["14"],  # D24 14/01
    "2026-01-16": ["14"],  # D26 16/01
    "2026-01-27": ["14"],  # D37 27/01
    "2026-02-26": ["14"],  # D67 26/02
    "2026-02-27": ["14"],  # D68 27/02
    "2026-03-05": ["14"],  # D74 05/03
    "2026-03-07": ["14"],  # D76 07/03
    "2026-03-08": ["14"],  # D77 08/03
    "2026-03-09": ["14"],  # D78 09/03
    "2026-03-10": ["14"],  # D79 10/03
    "2026-03-11": ["14"],  # D80 11/03
    "2026-03-13": ["14"],  # D82 13/03
    "2026-03-14": ["14"],  # D83 14/03
    "2026-03-16": ["14"],  # D85 16/03
    "2026-03-17": ["14"],  # D86 17/03
    "2026-03-18": ["14"],  # D87 18/03
    "2026-03-19": ["14"],  # D88 19/03
    "2026-03-20": ["14"],  # D89 20/03
    "2026-03-21": ["14"],  # D90 21/03
    "2026-03-22": ["14"],  # D91 22/03
    "2026-03-23": ["14"],  # D92 23/03
    "2026-03-24": ["14"],  # D93 24/03
    "2026-03-25": ["14"],  # D94 25/03
    "2026-03-26": ["14"],  # D95 26/03
    "2026-03-28": ["14"],  # D97 28/03
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
        raise ValueError(f"Ngày {day_key} tồn tại nhưng không phải object JSON.")

    if day_key not in data:
        # Chỉ tạo key mới nếu key ngày chưa có (đúng rule mục 2.3)
        data[day_key] = {}

    missing = [id_str for id_str in ids if id_str not in data[day_key]]

    # Add-only: set những ID cần có, không xoá bất kỳ ID nào khác.
    for id_str in ids:
        data[day_key][id_str] = True

    return missing


def main() -> None:
    if not FILE_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy file: {FILE_PATH.resolve()}")

    data = load_json(FILE_PATH)

    total_added = 0
    for day_key in sorted(REQUIRED.keys()):
        ids = REQUIRED[day_key]
        missing = ensure_ids_for_day(data, day_key, ids)
        if missing:
            # Tránh lỗi encoding trên một số Windows console (cp1252)
            print(f"[{day_key}] added_missing: {missing}")
            total_added += len(missing)
        else:
            print(f"[{day_key}] already_ok")

    save_json(FILE_PATH, data)
    print(f"done. total_added={total_added}")


if __name__ == "__main__":
    main()


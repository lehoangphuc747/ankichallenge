# Plan mini: chỉ update theo yêu cầu mới (D99 & D100)

Nguồn rule: `.cursor/rules/astro/RULE-studyRecords.md`

## 1) Mốc ngày

Mốc đã chốt:
- **D96 = 2026-03-27**

Suy ra:
- **D99 = 2026-03-30**
- **D100 = 2026-03-31**

## 2) Scope duy nhất cần thêm

### D99 (2026-03-30)
- `meo xinh dep` → **ID 49**

### D100 (2026-03-31)
- `vu` → **33**
- `luxultm` → **86**
- `ava` → **26**
- `tai tran` → **36**
- `bich` → **42**
- `serene flow` → **66**

## 3) Cách thêm (add-only)

- Nếu ngày đã tồn tại:
  - Chỉ thêm các ID còn thiếu.
  - Không xoá bất kỳ ID cũ nào.
- Nếu ngày chưa tồn tại:
  - Tạo key ngày mới với đúng các ID cần thêm.

## 4) Python script (chỉ đúng scope này)

```python
import json
from pathlib import Path

FILE_PATH = Path("public/data/studyRecords.json")
REQUIRED = {
    "2026-03-30": ["49"],  # D99: meo xinh dep
    "2026-03-31": ["33", "86", "26", "36", "42", "66"],  # D100
}


def main() -> None:
    with FILE_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    for day_key, ids in REQUIRED.items():
        if day_key not in data:
            data[day_key] = {}
        for id_str in ids:
            data[day_key][id_str] = True  # add-only

    with FILE_PATH.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("done")


if __name__ == "__main__":
    main()
```

## 5) Verify sau khi chạy

- Parse JSON không lỗi.
- `data["2026-03-30"]["49"] === true`
- `data["2026-03-31"]` có đủ: `33, 86, 26, 36, 42, 66`
- Không xoá ID cũ ở 2 ngày này.

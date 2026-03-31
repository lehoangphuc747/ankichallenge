# Plan chuẩn hoá mapping D96–D100 (tháng 03/2026)

Nguồn rule: `.cursor/rules/astro/RULE-studyRecords.md`

## 1) Mốc ngày và cách suy ra Dxx → YYYY-MM-DD

Bạn đã chốt **D96 = 27/03/2026** nên đây là mốc chuẩn (theo Rule mục 5).

Từ mốc này suy ra **Day 01 của challenge**:

- Vì \(D96 = D01 + 95 ngày\) nên **D01 = 2025-12-22**.

Suy ra:

- **D96 = 2026-03-27**
- **D97 = 2026-03-28**
- **D98 = 2026-03-29**
- **D99 = 2026-03-30**
- **D100 = 2026-03-31**

## 2) Chuẩn hoá nickname (alias/typo) trước khi map ID

Theo rule (mục 6), mình sẽ chuẩn hoá các biến thể sau:

- `tho cao` → `thocao`
- `wwind` → `wind`
- `tai trna` → `tai tran`
- `13 nov` / `13 nov.` / `13nov` / `13 nov` (có khoảng trắng) → `13nov`
- `endorphine` → `endorphin_111 (Medstu QuangXo)`

## 3) Map nickname → ID (chuẩn)

### 3.1 Bảng map chắc chắn (có trong RULE)

- `tram1601` → **34**
- `vu` → **33**
- `duy sanji` → **37**
- `luxultm` → **86**
- `alan le` → **79**
- `madbear` → **9**
- `bich` → **42**
- `npchieens` → **56**
- `nothin` → **43**
- `kirstin` → **45**
- `chauvegas` → **46**
- `dulgi` → **52**
- `thocao` → **24**
- `meo xinh dep` → **49**
- `wind` → **64**
- `serene flow` → **66**
- `andrew` → **69**
- `leductuan73` → **38**
- `long hoang` → **39**
- `minh may mắn` → **30**
- `tai tran` → **36**
- `johnny l` → **68**
- `the mink` → **82**
- `ava` → **26**
- `linh0101` → **63**
- `13nov` → **32**

### 3.2 Tên “endorphine” (đã xác nhận)

Trong `users.json` hiện có nickname `endorphin_111 (Medstu QuangXo)` với **ID 14**.

- `endorphine` → **ID 14**

## 4) Danh sách cần cập nhật (Dxx: nickname list → ID list)

### 4.1 D96 (2026-03-27)

Bạn gõ:
- `chauvegas, dulgi`

Map ID:
- **46, 52**

### 4.2 D98 (2026-03-29)

Bạn gõ:
- `luxultm, nothin, serene flow, chauvegas, tho cao, tai tran, wwind, johnny l, kirstin, dulgi, andrew, the mink, linh0101, meo xinh dep`

Chuẩn hoá:
- `tho cao`→`thocao`
- `wwind`→`wind`

Map ID:
- **86, 43, 66, 46, 24, 36, 64, 68, 45, 52, 69, 82, 63, 49**

### 4.3 D99 (2026-03-30)

Bạn gõ:
- `dulgi, johnny l, nothin, madbear, tai trna, serene flow, wind, leductuan73, btram 89888, thocao, minh may mắn, kirstin, long hoang, 13 nov, andrew, endorphine, ava, bich, luxultm, chauvegas, linh0101, the mink, duy sanji, alan le, vu, tram1601`

Chuẩn hoá:
- `tai trna`→`tai tran`
- `13 nov`→`13nov`
- `endorphine`→`endorphin_111` (ID 14)

Map ID:
- **52, 68, 43, 9, 36, 66, 64, 38, 58, 24, 30, 45, 39, 32, 69, 14, 26, 42, 86, 46, 63, 82, 37, 79, 33, 34**

### 4.4 D100 (2026-03-31)

Bạn gõ:
- `tram1601, chauvegas, duy sanji, vu`

Map ID:
- **34, 46, 37, 33**

## 5) Cách mình sẽ “thêm” vào `public/data/studyRecords.json` (không xoá)

Theo rule mục 2 & 3:

- Với mỗi ngày `YYYY-MM-DD` tương ứng (D96/D98/D99/D100):
  - Nếu ngày **đã tồn tại** trong `studyRecords.json`:
    - Mình sẽ **chỉ thêm** những ID ở trên **nếu chưa có**.
    - **Không xoá** bất kỳ ID nào đang có.
  - Nếu ngày **chưa tồn tại**:
    - Mình sẽ **tạo mới** key ngày đó với **chỉ** các ID bạn gõ (sau khi chuẩn hoá).

## 6) Checklist tự kiểm trước khi báo “xong”

- Check 1: D96/D98/D99/D100 map đúng ngày theo mốc D96=2026-03-27.
- Check 2: Mọi nickname map đúng ID theo rule (các typo đã chuẩn hoá rõ ràng).
- Check 3: Chỉ thêm, không xoá.
- Check 4: Verify lại từng ngày vừa sửa có đủ ID yêu cầu.

## 7) Checklist riêng: `meo xinh dep` (ID 49) cho các ngày bạn nêu

Đơn vị: `meo xinh dep` → **ID 49** (theo bảng rule).

Chuẩn hoá ngày (theo mốc D96 = 27/03/2026):

- `D29` (19/01) → `2026-01-19`
- `D75` (06/03) → `2026-03-06`
- `D81` (12/03) → `2026-03-12`
- `D84` (15/03) → `2026-03-15`

Yêu cầu kiểm tra:
- Sau khi update, với mỗi key ngày ở trên: object của ngày đó **phải có** `49: true`.

## 8) Checklist riêng: Quang Xồ / `endorphin_111` (ID 14) cho các ngày bạn nêu

Đơn vị: `endorphin_111 (Medstu QuangXo)` → **ID 14** (alias bạn hay gõ: `endorphine`).

Các ngày cần đảm bảo có `14: true` (bạn đã cung cấp cả Dxx và ngày):

- `D12` (02/01) → `2026-01-02`
- `D24` (14/01) → `2026-01-14`
- `D26` (16/01) → `2026-01-16`
- `D37` (27/01) → `2026-01-27`
- `D67` (26/02) → `2026-02-26`
- `D68` (27/02) → `2026-02-27`
- `D74` (05/03) → `2026-03-05`
- `D75` (06/03) → `2026-03-06`
- `D76` (07/03) → `2026-03-07`
- `D77` (08/03) → `2026-03-08`
- `D78` (09/03) → `2026-03-09`
- `D79` (10/03) → `2026-03-10`
- `D80` (11/03) → `2026-03-11`
- `D81` (12/03) → `2026-03-12`
- `D82` (13/03) → `2026-03-13`
- `D83` (14/03) → `2026-03-14`
- `D84` (15/03) → `2026-03-15`
- `D85` (16/03) → `2026-03-16`
- `D86` (17/03) → `2026-03-17`
- `D87` (18/03) → `2026-03-18`
- `D88` (19/03) → `2026-03-19`
- `D89` (20/03) → `2026-03-20`
- `D90` (21/03) → `2026-03-21`
- `D91` (22/03) → `2026-03-22`
- `D92` (23/03) → `2026-03-23`
- `D93` (24/03) → `2026-03-24`
- `D94` (25/03) → `2026-03-25`
- `D95` (26/03) → `2026-03-26`
- `D96` (27/03) → `2026-03-27`
- `D97` (28/03) → `2026-03-28`
- `D98` (29/03) → `2026-03-29`
- `D99` (30/03) → `2026-03-30`
- `D100` (31/03) → `2026-03-31`

Yêu cầu kiểm tra:
- Sau khi update, với mỗi key ngày ở trên: object của ngày đó **phải có** `14: true`.

## Cách mình sẽ “thêm” (add-only, không xoá/không thay thế object ngày)

Mình sẽ **chạy 1 Python add-only script “full”** để đảm bảo:
- **Không xoá** bất kỳ ID nào đang có.
- **Không replace** object ngày (chỉ set thêm key ID còn thiếu).
- Có thể chạy nhiều lần cũng không sao (idempotent): lần sau sẽ báo “đã đủ”.

Script sẽ áp dụng cho:
- D96/D98/D99/D100 (theo list nickname bạn gõ ở mục 4)
- Và các mốc kiểm `meo xinh dep` bạn bổ sung (D29/D75/D81/D84)

### Python script (chạy từ root project)

```python
import json
from pathlib import Path

FILE_PATH = Path("public/data/studyRecords.json")

REQUIRED = {
    # D96 (2026-03-27): chauvegas, dulgi
    "2026-03-27": ["46", "52", "14"],

    # D98 (2026-03-29): luxultm, nothin, serene flow, chauvegas, thocao, tai tran,
    #                   wind, johnny l, kirstin, dulgi, andrew, the mink, linh0101, meo xinh dep
    "2026-03-29": ["86", "43", "66", "46", "24", "36", "64", "68", "45", "52", "69", "82", "63", "49", "14"],

    # D99 (2026-03-30): dulgi, johnny l, nothin, madbear, tai tran, serene flow, wind,
    #                   leductuan73, btram 89888, thocao, minh may mắn, kirstin, long hoang,
    #                   13nov, andrew, endorphin_111, ava, bich, luxultm, chauvegas, linh0101,
    #                   the mink, duy sanji, alan le, vu, tram1601
    "2026-03-30": [
        "52", "68", "43", "9", "36", "66", "64", "38", "58", "24", "30", "45", "39",
        "32", "69", "14", "26", "42", "86", "46", "63", "82", "37", "79", "33", "34"
    ],

    # D100 (2026-03-31): tram1601, chauvegas, duy sanji, vu
    "2026-03-31": ["34", "46", "37", "33", "14"],

    # Checklist riêng meo xinh dep (ID 49)
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


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data):
    # indent=2 để file dễ đọc; write newline cuối file để hạn chế diff lạ
    with path.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def ensure_ids_for_day(data: dict, day_key: str, ids: list[str]):
    if day_key in data and not isinstance(data[day_key], dict):
        raise ValueError(f"Ngày {day_key} tồn tại nhưng không phải object JSON.")

    if day_key not in data:
        # Chỉ tạo key mới nếu key ngày chưa có (đúng rule mục 2.3)
        data[day_key] = {}

    missing = [id_str for id_str in ids if id_str not in data[day_key]]

    # Add-only: set những ID còn thiếu, không xoá bất kỳ ID nào khác.
    for id_str in ids:
        data[day_key][id_str] = True

    return missing


def main():
    if not FILE_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy file: {FILE_PATH.resolve()}")

    data = load_json(FILE_PATH)

    total_added = 0
    for day_key, ids in REQUIRED.items():
        missing = ensure_ids_for_day(data, day_key, ids)
        if missing:
            print(f"[{day_key}] thêm thiếu: {missing}")
            total_added += len(missing)
        else:
            print(f"[{day_key}] đã có đủ các ID yêu cầu")

    save_json(FILE_PATH, data)
    print(f"Hoàn tất. Tổng số ID được thêm: {total_added}")


if __name__ == "__main__":
    main()
```

### Verify sau khi chạy
- Parse JSON (không lỗi).
- Verify tối thiểu:
  - `2026-03-27` có `46, 52, 14`
  - `2026-03-29` có `86, 43, 66, 46, 24, 36, 64, 68, 45, 52, 69, 82, 63, 49, 14`
  - `2026-03-30` có `52, 68, 43, 9, 36, 66, 64, 38, 58, 24, 30, 45, 39, 32, 69, 14, 26, 42, 86, 46, 63, 82, 37, 79, 33, 34`
  - `2026-03-31` có `34, 46, 37, 33, 14`
  - `meo xinh dep`: `data["2026-01-19"]["49"] === true`, tương tự `2026-03-06`, `2026-03-12`, `2026-03-15`.
  - `Quang Xồ / ID 14`: `data["2026-01-02"]["14"] === true` và tương tự cho toàn bộ list ngày ở mục 8.

 


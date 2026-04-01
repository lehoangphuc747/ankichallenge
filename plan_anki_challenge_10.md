# Plan Anki Challenge 10 - Form Registration

## Form Flow (Conditional Display)

### Step 1: Initial Display
- Only show **Cam kết (Commitment)** field on page load
- Hide all other form fields

### Step 2: After Commitment Selection
- If user selects **"Tôi cam kết"** → Show **Đã hoàn thành xuất sắc Anki Challenge 9?** field
- If user selects **"Tôi cần cân nhắc thêm"** → Keep other fields hidden

### Step 3: Challenge 9 Completion - TWO PATHS

#### **Path A: "Chính xác 😎" (YES - Passed Challenge 9 with 95+ days)**
- Display informational note:
  ```
  🎉 Xuất sắc! Bạn đã hoàn thành xuất sắc Challenge 9.
  
  Bạn có quyền tham gia Challenge 10 mà không cần đóng tiền.
  
  Tuy nhiên, nếu bạn muốn hỗ trợ để duy trì cộng đồng, 
  chúng tôi rất hoan nghênh! Bạn cứ thoải mái chuyển khoản,
  chúng mình không chê đâu 😊
  ```
- Display QR code image for bank transfer (optional contribution)
- Auto-fill the following fields from `excellence_completers_challenge_9.json`:
  - Họ và tên (Full Name) ← from `name` field
  - Nam sinh (Year of Birth) ← from `birthYear` field
  - Link social (Facebook Profile Link) ← from `facebookUrl` field
  - Nickname (Discord Nickname) ← from `discordNickname` field
- **Important:** All auto-filled fields remain fully editable - user can modify any value before submission
- Immediately show all remaining fields for editing:
  - Khu vực / thành phố
  - Số điện thoại
  - Mục tiêu ngắn
  - Quote (optional)
  - Ngôn ngữ đang học
- Note: Trạng thái đóng phí is NOT required for Path A (they can proceed without payment)

#### **Path B: "Ờm...." (NO - Did NOT pass Challenge 9)**
- Show **Trạng thái đóng phí** field only
- **Important:** Fee status is MANDATORY - user MUST select either "Đã đóng phí" or "Chưa đóng phí" before remaining fields are shown
- **Submission Blocking:** Form cannot be submitted until fee status is confirmed (will trigger validation error if attempted)
- After user selects fee status, then show remaining input fields:
  - Họ và tên (required input)
  - Nam sinh (required input)
  - Khu vực / thành phố (required input)
  - Link social (required input)
  - Số điện thoại (required input)
  - Nickname (required input)
  - Mục tiêu ngắn (required input)
  - Quote (optional)
  - Ngôn ngữ đang học (required input)

---

## Form Fields & Requirements

### 1. Cam kết (Commitment)
- **Type:** Radio buttons
- **Options:**
  - Tôi cam kết
  - Tôi cần cân nhắc thêm
- **Required:** Yes

### 2. Đã hoàn thành xuất sắc Anki Challenge 9? (Challenge 9 Completion)
- **Type:** Radio buttons
- **Options:**
  - Chính xác 😎
  - Ờm....
- **Required:** Yes
- **Display Condition:** Shown after "Cam kết" is set to "Tôi cam kết"
- **Note:** This field determines the form flow (Path A vs Path B)

### 3. Trạng thái đóng phí (Fee Status)
- **Type:** Radio buttons
- **Options:**
  - Đã đóng phí
  - Chưa đóng phí
- **Display Condition:** 
  - Path A: Shown after Challenge 9 = "Chính xác 😎" (Optional field - can skip)
  - Path B: Shown immediately after Challenge 9 = "Ờm...." (Mandatory field)
- **Submission Behavior:**
  - Path A: Optional - form can be submitted without selecting fee status
  - Path B: REQUIRED - form cannot be submitted until fee status is selected (triggers validation error if user tries to submit without selection)

### 4. Họ và tên (Full Name)
- **Type:** Text input
- **Placeholder:** Lê Hoàng Phúc
- **Required:** Yes
- **Auto-fill:** If Challenge 9 = "Chính xác 😎" (Path A), this field will be automatically populated from user profile

### 5. Nam sinh (Year of Birth)
- **Type:** Text input (4 digits only)
- **Placeholder:** 2001
- **Validation:** 4-digit numbers, no increment/decrement buttons
- **Required:** Yes
- **Auto-fill:** If Challenge 9 = "Chính xác 😎" (Path A), this field will be automatically populated from user profile

### 6. Khu vực / thành phố (Location)
- **Type:** Text input
- **Placeholder:** Chuncheon
- **Required:** Yes
- **Display Condition:**
  - Path A: Shown after Challenge 9 and Fee status selection
  - Path B: Shown after Fee status selection

### 7. Link social (Facebook Profile Link)
- **Type:** Text input
- **Placeholder:** fb.com/...
- **Helper Button:** "Lấy link FB" opens https://www.facebook.com/me
- **Required:** Yes
- **Auto-fill:** If Challenge 9 = "Chính xác 😎" (Path A), this field will be automatically populated from user profile

### 8. Số điện thoại (Phone Number)
- **Type:** Tel input
- **Placeholder:** 0346598402
- **Validation:**
  - Must start with 0
  - Exactly 10 digits
- **Required:** Yes
- **Display Condition:**
  - Path A: Shown after Challenge 9 and Fee status selection
  - Path B: Shown after Fee status selection

### 9. Nickname (Discord Nickname)
- **Type:** Text input
- **Placeholder:** madbear
- **Required:** Yes
- **Auto-fill:** If Challenge 9 = "Chính xác 😎" (Path A), this field will be automatically populated from user profile

### 10. Mục tiêu ngắn (Short Goal)
- **Type:** Text input
- **Placeholder:** Học 30 phút/ngày
- **Required:** Yes

### 11. Quote
- **Type:** Text input
- **Placeholder:** không có quote
- **Required:** No (Optional)

### 12. Ngôn ngữ đang học (Learning Language)
- **Type:** Text input
- **Placeholder:** tiếng Hàn
- **Required:** Yes

## Submission Settings
- **Endpoint:** Google Forms formResponse
- **Method:** POST (native form submit)
- **Target:** Hidden iframe (no page redirect)
- **Validation:** Client-side `form.reportValidity()` before submit

## Auto-fill Logic (Path A Only)
When user selects "Chính xác 😎" for Challenge 9:
- Auto-populate these 4 fields from user's existing profile data:
  - **Họ và tên** (Full Name)
  - **Nam sinh** (Year of Birth)
  - **Link social** (Facebook Profile Link)
  - **Nickname** (Discord Nickname)
- User can edit these auto-filled values before final submission

## UI/UX
- Dark gradient background
- Radio buttons with green accent (#00ff94)
- Submit button with cyan-to-green gradient
- Success card with hidden form swap
- **Path A Special Elements:**
  - Success message card with congratulatory note (before form fields)
  - QR code image for bank transfer displayed prominently
  - Friendly reminder that payment is optional
- **QR Code Specifications:**
  - Display size: Medium (centered, ~300x300px recommended)
  - Location: Between the congratulatory note and form fields in Path A
  - Placeholder text below QR: "Optional: Scan to contribute (Quét để hỗ trợ)"

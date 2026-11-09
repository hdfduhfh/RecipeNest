# Kết quả kiểm thử RecipeNest

Ngày kiểm tra: **31/10/2026**. Mã nguồn đã chạy qua HTTP tại `http://127.0.0.1:4175`.

## Môi trường thực tế

- Windows 10/11 (user agent báo Windows NT 10.0).
- Trình duyệt trong ứng dụng ChatGPT, engine báo **Chrome/156.0.0.0**. Đây là user agent, không khẳng định bản Chrome desktop cài riêng.
- Node.js **24.19.0**.
- AngularJS **1.8.2**, angular-route **1.8.2**.
- Viewport: **360 × 900, 768 × 900, 1280 × 900**; kiểm tra trực quan mobile ở **360 × 800**.

## Kiểm tra tự động

`npm test` → **33 tests, 33 passed, 0 failed**.

29 test kiểm tra schema, liên kết ID, ảnh local, khẩu phần, rounding, unit, non-scalable ingredient, keyword, AND filters, sort, immutable dataset, loại trùng ID, làm sạch planner và tài nguyên template/script.

4 test bổ sung chạy trực tiếp factory `SavedData` thực tế với dependency được cung cấp bằng test harness: favourite persistence, planner replacement/removal/persistence, JSON lỗi, storage bị chặn và fallback trong bộ nhớ. Đây là test service với mock storage, không phải tuyên bố đã thay quyền lưu trữ của trình duyệt thật.

## Kiểm tra giao diện thực tế

| ID | Thao tác / đầu vào | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|
| UI01 | Mở catalogue ban đầu | 24 món | Đạt: 24 món, A–Z |
| UI02 | Search `basil` + Italian + Breakfast + ≤15 min + Vegan | Chỉ Tomato & basil bruschetta | Đạt: 1 món |
| UI03 | Mở món từ UI02 rồi Back to recipes | Giữ tất cả filter | Đạt: vẫn 1 món và filter giữ nguyên |
| UI04 | Keyword `nothing-xyz-999` | 0 kết quả và gợi ý clear | Đạt |
| UI05 | Clear all | Trả 24 món, bỏ filter | Đạt |
| UI06 | Lemon pasta, 180 g / base 2, requested 1, 6, 20 | 90 g, 540 g, 1800 g | Đạt; salt to taste không nhân |
| UI07 | Requested 0, 21, 1.5, trống | Báo lỗi, không hiển thị lượng mới | Đạt cả 4 trường hợp |
| UI08 | Save Lemon pasta rồi reload detail | Vẫn Saved to favourites | Đạt, deep-view refresh hoạt động |
| UI09 | Add to meal plan | Editor mở với công thức được chọn | Đạt, Monday Dinner |
| UI10 | Planner servings 1.5 và Save | Chặn lưu và báo lỗi | Đạt |
| UI11 | Lưu Monday Dinner 3 người; Tuesday Lunch rainbow bowl 2 người | Count 2; reload còn dữ liệu | Đạt |
| UI12 | Unsave pasta trong Favourites | Favourites rỗng, planner vẫn 2 bữa | Đạt |
| UI13 | Đổi Monday Dinner thành 1 người, xóa Tuesday Lunch | Monday 1 người, count 1 | Đạt |
| UI14 | Submit contact trống | 3 lỗi tại từng ô | Đạt |
| UI15 | Email `bad-email`, các ô khác hợp lệ | Lỗi email, không success | Đạt |
| UI16 | `Demo Cook`, `demo@example.com`, thông điệp mẫu | Xác nhận demo, không gửi/lưu | Đạt |
| UI17 | Reset contact | Xóa input, lỗi, success | Đạt |
| UI18 | Gallery: mở ảnh, Next, ArrowRight, Escape | Chuyển ảnh, đóng và trả focus | Đạt; focus trả về nút ảnh mở đầu |
| UI19 | Mobile 360: mở menu, chọn Recipes | Menu mở được, tự đóng sau chọn | Đạt, aria-expanded về false |
| UI20 | Mobile 360: sửa Monday Dinner | Editor vừa màn hình, ô nhập và nút dùng được | Đạt, kiểm tra trực quan |
| UI21 | 11 route × 3 viewport 360/768/1280 | Không tràn ngang, không ảnh lỗi | Đạt 33 lượt; xem viewport-checks.json |
| UI22 | Calculator 6 người → Add to meal plan | Editor giữ 6 người từ calculator | Đạt |
| UI23 | Recipe ID / contributor ID / route không tồn tại | Hiển thị trang lỗi có link quay lại | Đạt cả 3 trường hợp |

Không có console error/warning trong lượt kiểm tra cuối của trình duyệt.

### Viewport measurements

11 route đã đo: home, recipes, recipe/lemon-pasta, planner, favourites, collections, contributors, contributor/linh, gallery, about, contact.

`document.documentElement.scrollWidth` đo được 345, 753, 1265 px tương ứng viewport 360, 768, 1280 px (phần chênh là thanh cuộn dọc). Tất cả đều ≤ chiều rộng viewport. `brokenImages` = 0 tại thời điểm quan sát. Ảnh offscreen lazy-load còn được kiểm tra qua tồn tại tài nguyên và test dataset; không khẳng định phép đo DOM tức thời là kiểm tra mọi byte ảnh trong tất cả trình duyệt.

## Cần kiểm tra thêm trước khi nộp chính thức

- **Một trình duyệt desktop độc lập thứ hai** (ví dụ Microsoft Edge hoặc Firefox), ghi đúng version và chạy lại toàn bộ UI01–UI21. Chưa tuyên bố đạt yêu cầu kiểm tra đầy đủ hai trình duyệt desktop chỉ dựa vào trình duyệt trong ứng dụng.
- Thử trên thiết bị điện thoại thật nếu có. Các viewport nêu trên là mô phỏng kích thước, không phải kiểm tra thiết bị thật.
- Đọc bằng screen reader và kiểm tra WCAG toàn diện chưa thực hiện. Hiện đã có label, alt, focus rõ ràng, skip link và modal keyboard controls.
- Video demo **chưa được quay**; có kịch bản `DEMO-GUIDE.md` để bạn quay và nộp.

Không ghi các hạng mục chưa chạy là Passed. Node tests và các phép đo viewport có thể chạy lại bằng mã nguồn trong ZIP.

## Cập nhật hỗ trợ ngôn ngữ

Bản cập nhật năm ngôn ngữ đã bổ sung 11 ca kiểm thử, tổng hiện tại 44/44 ca đạt. Kết quả kiểm tra giao diện, giới hạn và hướng dẫn sửa bản dịch nằm trong [LANGUAGE-SUPPORT.md](LANGUAGE-SUPPORT.md).

### Bổ sung Hindi

Đã mở rộng kiểm thử sang Hindi: 45/45 ca đạt. Kiểm tra giao diện Hindi 33 lượt (11 route × 3 kích thước), không tràn ngang và không lỗi console. Chi tiết trong LANGUAGE-SUPPORT.md và hindi-viewport-checks.json.

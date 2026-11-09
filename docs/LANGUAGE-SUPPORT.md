# Hỗ trợ sáu ngôn ngữ trong RecipeNest

## Cách dùng

Mở website như cũ. Chọn ngôn ngữ ở bộ chọn trong header:

| Lựa chọn | Mã lưu | Thuộc tính HTML lang |
|---|---|---|
| English | en | en |
| Tiếng Việt | vi | vi |
| 日本語 | ja | ja |
| 中文 (Trung giản thể) | zh | zh-CN |
| Français | fr | fr |
| हिन्दी (Hindi) | hi | hi-IN |

Tiếng Anh đứng đầu và là mặc định khi chưa có lựa chọn, giá trị lưu không hợp lệ hoặc không đọc được bộ nhớ. Ứng dụng không tự suy ra ngôn ngữ từ trình duyệt/hệ điều hành. Sau khi chọn, ngôn ngữ được nhớ riêng theo địa chỉ và cổng của website.

Chuyển ngôn ngữ không reload route. Bộ lọc, nội dung form đang nhập, trạng thái xác thực, khẩu phần calculator, mục yêu thích và lịch ăn vẫn được giữ. Ngôn ngữ cũng đổi tiêu đề tab, mô tả ảnh, nhãn hỗ trợ đọc màn hình và thông báo. Tên thương hiệu, tên người và tên thư viện được giữ nguyên. Báo cáo, credits nguồn ảnh và tài liệu kỹ thuật không thuộc nội dung cần chuyển ngôn ngữ của giao diện.

## Nội dung đã dịch

- Header, footer, menu mobile, nút, nhãn, placeholder, trạng thái rỗng, lỗi nhập liệu và thông báo.
- Tên, mô tả, cả 4 bước nấu, ghi chú, nhãn chế độ ăn, chất gây dị ứng và mô tả ảnh của 24 công thức.
- Tên nguyên liệu và nhãn đơn vị; dữ liệu lượng và đơn vị chuẩn gốc không bị thay đổi.
- Bộ sưu tập, tiểu sử và nội dung hồ sơ người đóng góp hư cấu.
- Các ngày, bữa ăn, trình sửa planner, xác nhận form và calculator.

Tìm kiếm chấp nhận tên món/nguyên liệu theo ngôn ngữ đang chọn và từ khóa tiếng Anh. Tiếng Việt hỗ trợ tìm không dấu, gồm cả đ/d. Sắp xếp catalogue dùng `Intl.Collator` theo ngôn ngữ đang chọn. Các bộ lọc kết hợp vẫn dùng giá trị chuẩn như Italian, Breakfast và Vegan, trong khi nhãn được dịch.

## Cấu trúc mã nguồn

| File | Vai trò |
|---|---|
| js/i18n-core.js | Hàm thuần: danh sách ngôn ngữ, chuẩn hóa, dịch, thay tham số, phục hồi lựa chọn và tìm/sắp xếp đa ngôn ngữ |
| js/i18n-angular.js | Service I18n, filter t/tList, cập nhật lang/title và sự kiện languageChanged |
| js/translations.js | Bundle từ điển local cho cả sáu ngôn ngữ; không tải dịch vụ bên ngoài |
| css/i18n.css | Khoảng trống cho nhãn dài, menu/selector mobile và font hỗ trợ Việt/Nhật/Trung |
| tools/ui-source.json | Nội dung gốc tiếng Anh của các chuỗi giao diện |
| tools/ui-translations.txt | Bản dịch giao diện; cột đầu là chỉ số trong ui-source.json |
| tools/common-translations.txt | Thuật ngữ, nhãn, thông báo có tham số, nguyên liệu và mô tả ảnh |
| tools/recipe-translations.txt | Nội dung công thức theo ID và trường: name, description, notes, 0–3 là các bước nấu |
| tools/other-content.txt | Hồ sơ người đóng góp và bộ sưu tập theo ID |
| tools/hindi-translations.txt | Bản dịch Hindi theo nguồn tham chiếu ui/common/recipe/other/image |
| tools/build-translations.py | Tạo lại bundle và kiểm tra đủ bản dịch cho dữ liệu món ăn |
| tests/i18n.test.js | Kiểm thử mặc định, lưu lựa chọn, dữ liệu dịch, tìm kiếm, bộ lọc, tham số và dịch vụ AngularJS |

Template dùng filter `t` và các khóa ổn định `text.<hash>` để không nhúng đoạn văn dài vào biểu thức HTML. Bundle có ánh xạ tiếng Anh cho các khóa này. Những giá trị động như tên món dùng trực tiếp `recipe.name | t`. Filter có `$stateful` để cập nhật ngay khi ngôn ngữ thay đổi.

## Sửa bản dịch

Mở các file `.txt` trong `tools`. Mỗi dòng có 5 cột, phân cách bằng ký tự `¦`: khóa, tiếng Việt, tiếng Nhật, tiếng Trung, tiếng Pháp. Giữ nguyên tham số `{name}`, `{recipe}`, `{slot}` hoặc `{count}` nếu có. Không đưa ký tự `¦` vào câu dịch.

Sau khi sửa, chạy từ thư mục RecipeNest:

```sh
python tools/build-translations.py
npm test
```

Không cần cài thêm gói để tạo bản dịch; script chỉ dùng thư viện chuẩn Python. Với việc sửa câu dịch hiện có, không cần sửa template và không cần đổi dữ liệu `data/recipes.json`.

## Lưu dữ liệu và tương thích

Ngôn ngữ lưu dưới khóa `recipenest.language.v1`. Khóa này tách biệt với `recipenest.favourites.v1` và `recipenest.plan.v1`. Không đổi format của favourite hoặc planner, không sửa ID món, không di chuyển dữ liệu cũ. Nếu không lưu được ngôn ngữ, lựa chọn vẫn hoạt động trong tab và có cảnh báo.

Để chỉ đặt lại ngôn ngữ, chọn English hoặc xóa đúng khóa ngôn ngữ rồi reload. Không cần xóa món yêu thích và lịch ăn. Các giá trị hiển thị được render như text qua AngularJS, không dùng ng-bind-html và không gửi nội dung form lên backend.

## Kiểm thử thực tế

- `npm test`: **45/45 ca đạt**, gồm các kiểm tra cũ và kiểm tra Hindi bổ sung.
- Trình duyệt trong ứng dụng: **165 lượt màn hình**, gồm 5 ngôn ngữ × 11 route × 3 độ rộng 360, 768, 1280 px. Không tràn ngang, không hiện mã dịch thô và không có console error/warning trong lượt kiểm tra cuối. Chi tiết: `language-viewport-checks.json`.
- Kiểm tra lựa chọn ngôn ngữ còn sau reload; tìm `dau hu` và `豆腐` trả các món liên quan.
- Kiểm tra keyword basil + Italian + Breakfast + ≤15 phút + Vegan: cùng 1 công thức trong cả sáu ngôn ngữ; giá trị bộ lọc vẫn giữ nguyên khi nhãn đổi.
- Nhập tên/email/thông điệp, đổi ngôn ngữ trước và sau submit: giữ nội dung và xác nhận demo được dịch. Không email nào được gửi.
- Calculator 6 người vẫn giữ 540 g spaghetti khi chuyển sang tiếng Pháp; thêm vào planner giữ 6 người, đổi sang tiếng Việt rồi reload vẫn còn bữa đó. Favourite vẫn tham chiếu cùng ID.
- Menu mobile Nhật mở được, chọn Recipes tự đóng và aria-expanded trả về false.
- Ảnh chụp thực tế: `languages-desktop.png`, `languages-mobile.png`. Dữ liệu đã lưu trong ảnh là dữ liệu thử trên cổng preview riêng, không được đưa vào mặc định của dự án.

Đây là kiểm tra trên trình duyệt trong ứng dụng và viewport mô phỏng; chưa khẳng định kiểm thử đầy đủ trình duyệt desktop thứ hai hoặc điện thoại thật. Các giới hạn kiểm thử cũ trong TEST-RESULTS.md vẫn áp dụng.

## Bổ sung Hindi

Hindi (हिन्दी) là lựa chọn thứ sáu, mã `hi`, locale `hi-IN`. Tiếng Anh vẫn đứng đầu và làm mặc định. Bản dịch của năm ngôn ngữ trước đã được so sánh và giữ nguyên.

File `tools/hindi-translations.txt` dùng hai cột, cách nhau bằng `¦`: tham chiếu nguồn và bản dịch Hindi. Tiền tố `ui:` chỉ chỉ số trong ui-source.json; `common:` chỉ chuỗi tiếng Anh; `recipe:` chỉ ID và trường; `other:` chỉ contributor/collection; `image:` chỉ ID món. Sau khi sửa chạy lại `python tools/build-translations.py`, rồi `npm test`. Các file dịch Việt/Nhật/Trung/Pháp vẫn giữ cấu trúc 5 cột cũ.

Đã kiểm tra Hindi trên 11 route ở độ rộng 360, 768 và 1280 px: 33 lượt, không tràn ngang, không hiện mã bản dịch hoặc lỗi console. Dữ liệu tại `hindi-viewport-checks.json`. Tìm `बेसिल` trả 3 món liên quan; kết hợp Italian + Breakfast + 15 phút + Vegan còn 1 bruschetta. Chọn Hindi rồi reload vẫn giữ ngôn ngữ và HTML lang hi-IN. Font hỗ trợ Devanagari được áp dụng riêng, không tải font từ mạng. Ảnh chụp tại `hindi-desktop.png`.

## Thiết kế bộ chọn lá cờ theo bài mẫu

Đã thay select cũ bằng nút tròn có ảnh cờ SVG, theo header trong dự án Sweet Bakery do người dùng cung cấp. Bảng mở nền trắng, rộng 260 px, bo góc 18 px, có bóng đổ, mỗi dòng gồm cờ, tên bản ngữ và mã viết tắt. Dòng đang chọn dùng nền kem và chữ màu rượu vang. Tái sử dụng 5 SVG từ mẫu và bổ sung SVG Ấn Độ cho Hindi. English vẫn đứng đầu và làm mặc định.

- `templates/language-picker.html`: summary/details và danh sách 6 nút chọn.
- `js/language-picker.js`: directive nối với service I18n hiện có, đóng sau khi chọn, khi bấm ngoài, nhấn Escape hoặc đổi route; hỗ trợ mũi tên, Home và End, trả focus về nút cờ sau khi chọn.
- `css/language-picker.css`: thiết kế tham chiếu, giới hạn kích thước panel và header mobile.
- `assets/images/flags/`: sáu ảnh SVG local, không dùng emoji hoặc dịch vụ mạng.

Kiểm tra UI: 24 tổ hợp (6 ngôn ngữ × 320/360/768/1280 px), không tràn trang hoặc panel, mỗi bảng chỉ có một dòng đang chọn và không có cờ lỗi. Đã thử bàn phím, Escape, bấm ngoài, nhớ ngôn ngữ sau reload, giữ form và calculator 6 người với 540 g pasta, giữ favourite. Menu mobile vẫn mở/đóng và chuyển trang bình thường. Kết quả chi tiết: `flag-picker-checks.json`; ảnh: `flag-picker-desktop.png`, `flag-picker-mobile.png`. Các ca tự động hiện có vẫn đạt 45/45.

Dữ liệu trên ảnh là dữ liệu thử ở cổng preview riêng; không đưa dữ liệu trình duyệt thử vào mã nguồn.

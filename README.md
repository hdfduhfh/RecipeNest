# RecipeNest — AngularJS Website Development

Website tìm công thức nấu ăn và lập lịch ăn, thực hiện theo phần **Problem Statement / Functional Requirement Specification** của đề RecipeNest.

## Chạy nhanh trên Windows

1. Giải nén toàn bộ ZIP vào một thư mục, giữ nguyên các thư mục con.
2. Máy cần **Node.js 18 trở lên**. Không cần `npm install`.
3. Nhấp đúp `START-WINDOWS.bat`.
4. Mở **http://127.0.0.1:4175** trong trình duyệt.
5. Giữ cửa sổ máy chủ mở trong lúc dùng; nhấn **Ctrl+C** khi muốn dừng.

Hoặc mở terminal ngay trong thư mục RecipeNest rồi chạy:

```sh
node server.js
```

**Chatbot mới:** xem [CHATBOT-SETUP.md](CHATBOT-SETUP.md) để kết nối **Ollama Cloud**.
Chưa cấu hình AI vẫn có thể tra cứu công thức trong khung chat. Dùng máy chủ Node của dự án;
không dùng Python để phục vụ thư mục chứa `.env` vì có thể làm lộ khóa.

**Không mở `index.html` trực tiếp bằng `file://`**: AngularJS tải JSON và các template qua HTTP. Các link dạng `#!/recipe/lemon-pasta` có thể mở trực tiếp hoặc tải lại mà không cần cấu hình chuyển hướng trên máy chủ.

Nếu cổng 4175 đã bị ứng dụng khác sử dụng, dùng một cổng khác. Ví dụ với PowerShell:

```powershell
$env:PORT='4180'
node server.js
```

Sau đó mở http://127.0.0.1:4180. Dữ liệu trình duyệt thuộc từng địa chỉ và cổng riêng.

## Các chức năng

- Trang chủ: tìm kiếm, công thức nổi bật, bộ sưu tập, giới thiệu planner.
- Catalogue: 24 công thức, tìm không phân biệt hoa thường theo tên/từ khóa/nguyên liệu, kết hợp 4 bộ lọc, sắp xếp A–Z/Z–A/thời gian, số kết quả, clear all, trạng thái rỗng.
- Chi tiết món: ID ổn định, nguyên liệu, cách nấu, thời gian, khẩu phần gốc, ghi chú, tag, allergen mẫu, người đóng góp và món liên quan.
- Calculator: số nguyên 1–20; lượng mới = lượng gốc × khẩu phần mới ÷ khẩu phần gốc; làm tròn 2 chữ số thập phân, giữ đơn vị. Salt/pepper “to taste” không nhân.
- Favourites: thêm/bỏ tim, chống trùng ID, lưu và phục hồi bằng Local Storage.
- Planner: 7 ngày × 3 bữa, mỗi ô 1 công thức và khẩu phần; thêm, đổi, xóa, đếm bữa đã lên lịch và phục hồi dữ liệu hợp lệ.
- Collections: món nhanh, bữa sáng, món chay, món Việt.
- Contributor: 3 hồ sơ hư cấu có ID liên kết công thức.
- Gallery: ảnh local, caption/credits, xem trước, previous/next, phím mũi tên, Escape, giữ focus trong hộp thoại và trả focus khi đóng.
- About: phạm vi, quy trình, giả định tính toán và credits.
- Contact: AngularJS kiểm tra bắt buộc + email, báo lỗi từng ô, reset và xác nhận minh họa; không gửi email hoặc lưu thông tin liên hệ.
- Navigation và giao diện responsive: menu mobile, active links, skip link, focus rõ ràng.

## Phạm vi / giả định

- Phần website gốc là bài thực hành **front-end**, không có đăng nhập, database hay giao dịch.
  Phần mở rộng chatbot bổ sung gateway Node phía máy chủ để kết nối Ollama Cloud tùy chọn; chỉ chạy cục bộ.
- Giao diện mặc định tiếng Anh, có thể đổi sang tiếng Việt, Nhật, Trung giản thể, Pháp và Hindi; hướng dẫn dùng tiếng Việt.
- Công thức, dietary tags, allergens là dữ liệu mẫu, không bảo đảm phù hợp một chế độ ăn. Người đóng góp là hư cấu.
- Ảnh Unsplash là ảnh minh họa nhóm món/nguyên liệu, không phải ảnh món nấu chính xác. Một số ảnh dùng lại trong các món cùng phong cách. Xem `assets/CREDITS.md`.
- Lượng nguyên liệu đếm được có thể ra số lẻ (ví dụ 1.5 trứng). Calculator hiển thị kết quả toán học; người nấu tự điều chỉnh thực tế.
- Thời gian là tổng thời gian chuẩn bị/nấu ước tính, không thay đổi khi tăng khẩu phần. Nước thêm để điều chỉnh độ sệt là process aid khi không có lượng cố định.
- Bỏ yêu thích **không xóa** bữa đã lên lịch. Planner tham chiếu ID công thức trong catalogue, không phụ thuộc danh sách yêu thích.
- Planner là tuần mẫu Monday–Sunday, không gắn ngày tháng cụ thể.
- Khi Local Storage lỗi, ứng dụng thông báo và tiếp tục trong bộ nhớ; dữ liệu có thể mất khi tải lại.

## Cấu trúc

```text
index.html                 Trang khung, header/footer, ng-view
css/styles.css             Giao diện và responsive
js/logic.js                Hàm thuần: validate, scale, filter, clean, count
js/app.js                  Module recipeNest, routes, controllers, services, directives
templates/                 Các AngularJS view và recipe-card
data/recipes.json          24 recipes + 3 contributors + 4 collections
data/build-samples.py      Script tạo lại dữ liệu mẫu (tùy chọn)
data/download-assets.py    Script tải lại ảnh (tùy chọn, cần Internet)
assets/images/             Ảnh JPEG local và favicon SVG
assets/vendor/             AngularJS / angular-route 1.8.2, MIT licence
assets/CREDITS.md           Nguồn ảnh và thư viện
server.js                  Khởi động máy chủ local và gateway AI
server/                    Cấu hình riêng, kết nối AI, truy xuất dữ liệu website
js/chat*.js                Khung chat, tra cứu công thức và bản dịch sáu ngôn ngữ
CHATBOT-SETUP.md            Hướng dẫn cấu hình AI trên máy
START-WINDOWS.bat          Khởi động nhanh bằng Node
tests/logic.test.js        Kiểm tra thuật toán và dữ liệu
docs/PROJECT-REPORT.html   Báo cáo, sơ đồ, test cases và ảnh chụp
docs/TEST-RESULTS.md       Kết quả kiểm thử thực tế và giới hạn
docs/DEMO-GUIDE.md         Kịch bản quay video thuyết trình
ReadMe.doc                Hướng dẫn dạng RTF mở được bằng Word
```

## AngularJS

Module `recipeNest` phụ thuộc `ngRoute`. `Catalogue` tải dữ liệu JSON và giữ filter để không mất bộ lọc khi xem chi tiết rồi quay lại. `SavedData` dùng chung cho favourite/planner và xử lý đọc/ghi Local Storage. `ShellController` quản lý navigation; các controller riêng quản lý catalogue, detail, planner, contact, gallery, collection, profile và favourites. `recipeCard` tái sử dụng card; `modalKeys` quản lý bàn phím và focus trong modal.

Ứng dụng dùng `ng-model`, `ng-repeat`, `ng-if`, `ng-class`, `ng-submit`, AngularJS form validation, data binding và hash routing. Nội dung người dùng được hiển thị như text bằng AngularJS interpolation, không dùng `ng-bind-html`.

## Kiểm tra và reset

```sh
npm test
```

Chỉ cần Node; không cài thêm thư viện. Xem các ca UI và kết quả trong `docs/TEST-RESULTS.md`.

Để reset: mở DevTools → Application/Storage → Local Storage → địa chỉ local, xóa các khóa tương ứng:

```text
recipenest.favourites.v1
recipenest.plan.v1
recipenest.language.v1
```

Hoặc xóa dữ liệu trang của địa chỉ này trong cài đặt trình duyệt. Reload để ứng dụng đọc lại. Contact form không lưu dữ liệu và không có mật khẩu.

## Phiên bản và ghi công

- AngularJS **1.8.2** và angular-route **1.8.2**, đưa sẵn trong ZIP. Nguồn: https://code.angularjs.org/1.8.2/ . MIT notice trong `assets/vendor/ANGULAR-LICENSE.txt`.
- Runtime kiểm tra: Node.js **24.19.0**; Python **3.14.6** chỉ dùng để tạo dữ liệu/đóng gói.
- Không dùng thư viện CSS, font từ xa hay API online khi vận hành.
- Xem `assets/CREDITS.md` và `docs/TEST-RESULTS.md` để biết nguồn tài nguyên, trình duyệt đã kiểm thử và các kiểm thử còn cần thực hiện.

## Chuyển ngôn ngữ

- Bộ chọn ngôn ngữ là **nút lá cờ tròn** ở góc phải header, theo thiết kế bài mẫu Sweet Bakery. Bấm để mở bảng có lá cờ, tên và mã ngôn ngữ; trên điện thoại nút nằm cùng hàng logo/menu.
- Có **English** (mặc định), **Tiếng Việt**, **日本語**, **中文** (Trung giản thể), **Français** và **हिन्दी** (Hindi).
- Lần mở đầu dùng tiếng Anh, không tự lấy ngôn ngữ hệ điều hành. Lựa chọn sau đó được nhớ bằng khóa `recipenest.language.v1`.
- Đổi ngôn ngữ ngay trên trang, giữ nguyên bộ lọc, nội dung form, khẩu phần, yêu thích và lịch ăn.
- Đã dịch giao diện, cả 24 công thức, nguyên liệu, cách nấu, ghi chú, bộ sưu tập, hồ sơ, thông báo và mô tả ảnh. Tên riêng và nhãn công nghệ giữ nguyên.
- Tìm kiếm hỗ trợ tên món/nguyên liệu ở ngôn ngữ đang chọn và từ khóa tiếng Anh; tiếng Việt chấp nhận từ không dấu. Mã món, giá trị filter và slot planner vẫn giữ chuẩn tiếng Anh để dữ liệu cũ không bị mất.
- Hindi là ngôn ngữ được bổ sung cho yêu cầu tiếng Ấn Độ; mã ngôn ngữ `hi`, HTML lang `hi-IN`.
- Tất cả bản dịch nằm local, không gọi API dịch hoặc cần Internet.
- Chi tiết cấu trúc, cách sửa bản dịch và kiểm thử: `docs/LANGUAGE-SUPPORT.md`.

# Kết nối chatbot với Ollama Cloud

## Bật AI trong VS Code

1. Mở thư mục **RecipeNest** trong VS Code.
2. Mở file **`.env`** đã tạo sẵn cùng cấp `server.js` (khóa đang để trống). Nếu làm mất file này, sao chép `.env.example` thành `.env`; đừng để Windows thêm `.txt`.
3. Điền khóa Ollama Cloud của bà sau dấu `=` trong dòng `OLLAMA_API_KEY`. Chỉ điền trên máy, không gửi khóa vào chat và không đặt trong HTML/JavaScript.
4. Giữ `OLLAMA_MODEL=gemma4:31b` hoặc đổi sang ID mô hình Cloud mà tài khoản của bà được phép dùng.
5. Mở Terminal trong thư mục RecipeNest, chạy `node server.js` (Node.js 18+). Không cần `npm install`. Nhấp đúp `START-WINDOWS.bat` cũng được.
6. Mở http://127.0.0.1:4175, bấm **Ask Nest** ở góc phải, thử hỏi: `Gợi ý món chay nấu nhanh`, rồi hỏi tiếp `Món đó cần nguyên liệu gì?`.

File `.env` cần có dạng sau; tự thay khóa trên máy:

```dotenv
OLLAMA_API_KEY=YOUR_PRIVATE_OLLAMA_KEY
OLLAMA_MODEL=gemma4:31b
```

Không cần cài ứng dụng Ollama, tải mô hình về máy hay chạy máy chủ ở cổng 11434. Bản này gọi trực tiếp **https://ollama.com/api/chat**, dùng Bearer key, lấy câu trả lời từ `message.content`. Đây là API Cloud, không phải Ollama chạy mô hình trên máy.

ID mặc định `gemma4:31b` được đối chiếu với danh sách Cloud khi tích hợp. Có thể xem [danh sách mô hình Cloud](https://ollama.com/api/tags) để đổi `OLLAMA_MODEL`; dùng chính xác trường `name` của API. Tên dùng khi gọi trực tiếp ollama.com có thể khác tên có hậu tố `-cloud` dùng với ứng dụng/CLI. Quyền và hạn mức thực tế phụ thuộc tài khoản của bà.

Sau khi sửa `.env`, **dừng máy chủ bằng Ctrl+C, chạy lại `node server.js`, rồi tải lại trang**. Biến môi trường `OLLAMA_API_KEY` / `OLLAMA_MODEL` cùng tên được ưu tiên hơn `.env`.

Khi cấu hình được nạp, khung chat hiển thị **AI · Ollama Cloud**. Nhãn này cho biết có cấu hình, không xác nhận khóa đã được Ollama chấp nhận; gửi một câu hỏi để kiểm tra kết nối thực tế. Bản tích hợp đã kiểm thử với phản hồi API giả lập, chưa dùng khóa thật của bà.

## Chatbot biết những gì?

- Trả lời dựa trên dữ liệu RecipeNest, không tìm kiếm Internet: tên món, nguyên liệu, thời gian, cách nấu, khẩu phần, thông tin website và hướng dẫn planner/favourites.
- Máy chủ đọc `data/recipes.json`, đưa danh mục và nội dung món liên quan vào câu hỏi AI. Không nhận chỉ dẫn hệ thống hay dữ liệu công thức tự gửi từ trình duyệt. Khởi động lại sau khi sửa JSON.
- Giữ tối đa 8 tin nhắn trước để hiểu câu hỏi tiếp theo. Trả lời theo ngôn ngữ đang chọn: English mặc định, Việt, Nhật, Trung, Pháp, Hindi.
- Hiển thị thẻ công thức để mở trang chi tiết. Thẻ là kết quả tìm kiếm liên quan; không phải xác minh từng câu AI sinh ra.
- Nút ↺ xóa cuộc trò chuyện và hủy lượt đang chờ. Chat nằm trong bộ nhớ trang, không lưu vào Local Storage và mất khi tải lại.

AI có thể trả lời sai dù đã có chỉ dẫn bám dữ liệu. Kiểm tra lại công thức trước khi nấu; không xem các dietary tags/allergens mẫu là bảo đảm phù hợp y tế.

## Khi chưa có khóa hoặc AI gặp lỗi

**Recipe guide · AI not connected** là chế độ tra cứu có quy tắc. Chế độ này tìm công thức, nguyên liệu, các bước nấu và hướng dẫn planner, không thay thế hội thoại AI. Ví dụ: `Meals under 20 minutes`, `ingredients lemon-pasta for 6 people`, `cách nấu lemon-pasta`.

Khi đã cấu hình AI mà mất mạng, sai khóa/model hoặc hết hạn mức, ứng dụng báo lỗi. Bà có thể thử lại hoặc chọn tra cứu công thức; ứng dụng không tự chuyển sang dịch vụ khác hoặc tự gửi lại yêu cầu có tính phí.

Nếu chưa hoạt động: kiểm tra tên file `.env` (không phải `.env.txt`), khóa, ID model và hạn mức trong tài khoản Ollama; khởi động lại Node và tải lại trang. Không chụp hoặc gửi khóa khi nhờ hỗ trợ.

## Dữ liệu và cách chạy

Tin nhắn, lịch sử gần đây và dữ liệu công thức được gửi tới **Ollama Cloud** khi dùng AI. Nhà cung cấp áp dụng chính sách dữ liệu và hạn mức/phí của họ. RecipeNest không lưu cuộc trò chuyện hay ghi khóa vào log.

**Dùng `node server.js` hoặc `START-WINDOWS.bat` cho bản có AI.** Live Server chỉ chạy giao diện và tra cứu, không có gateway AI. Không dùng `python -m http.server` cho thư mục chứa `.env` vì máy chủ đó có thể cho tải file khóa. Máy chủ Node của dự án chỉ phục vụ tài nguyên công khai, chặn `.env`, code máy chủ, test và công cụ.

Gateway chỉ lắng nghe `127.0.0.1`, hạn chế cùng nguồn, giới hạn độ dài, tần suất, số lượt đồng thời và thời gian chờ. Bản này phục vụ bài chạy cục bộ; cần bảo vệ tài khoản/hạn mức riêng trước khi đưa gateway lên Internet.

## Tài liệu và kiểm thử

- [Ollama Cloud: gọi trực tiếp API và ID mô hình](https://docs.ollama.com/cloud)
- [Ollama: xác thực API](https://docs.ollama.com/api/authentication)
- [Ollama: Chat API](https://docs.ollama.com/api/chat)

Chạy `npm test`: các bài kiểm thử dùng dữ liệu và phản hồi giả lập, không dùng khóa thật hoặc gửi yêu cầu có tính phí. Xem thêm `docs/CHATBOT-CHECKS.md`.

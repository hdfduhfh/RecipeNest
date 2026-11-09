"""Build local HTML report and an RTF-based .doc startup guide using the standard library."""

from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


def flow(title, nodes):
    height = len(nodes) * 82 + 30
    shapes = []
    for i, label in enumerate(nodes):
        y = 10 + i * 82
        shapes.append(
            f'<rect x="40" y="{y}" width="520" height="56" rx="8" fill="{["#e8eddf","#f6eee4"][i%2]}" stroke="#acb79d"/>'
        )
        for j, line in enumerate(label.split("|")):
            ty = y + 24 + (j * 17)
            shapes.append(
                f'<text x="300" y="{ty}" text-anchor="middle" font-size="13" fill="#29382e">{escape(line)}</text>'
            )
        if i < len(nodes) - 1:
            shapes.append(
                f'<path d="M300 {y+57} v19 m-5-5 5 5 5-5" fill="none" stroke="#b7472c" stroke-width="2"/>'
            )
    return f'<figure class="flow"><figcaption>{escape(title)}</figcaption><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{escape(title)}" viewBox="0 0 600 {height}">{"".join(shapes)}</svg></figure>'


requirements = [
    (
        "01",
        "Home",
        "Nhận diện, search, featured recipes, collections, giới thiệu tools",
        "home.html",
    ),
    (
        "02",
        "Catalogue",
        "24 records, ng-repeat, responsive cards và ID ổn định",
        "catalogue.html, card.html, recipes.json",
    ),
    (
        "03",
        "Search filtering sorting",
        "Keyword không phân biệt hoa thường, 4 filter AND, A–Z/Z–A, count, clear, no match, giữ filter",
        "CatalogueController, RecipeLogic.filterRecipes",
    ),
    (
        "04",
        "Recipe details",
        "Metadata, nguyên liệu, bước nấu, notes, tags/allergens mẫu, related, favourite, planner",
        "detail.html, DetailController",
    ),
    (
        "05",
        "Contributors",
        "3 hồ sơ hư cấu, background, interests, bio, liên kết ID",
        "contributors.html, profile.html",
    ),
    (
        "06",
        "Gallery",
        "Ảnh, alt/caption/credit, preview, previous/next, keyboard/focus",
        "gallery.html, GalleryController, modalKeys",
    ),
    (
        "07",
        "Calculator",
        "Input nguyên 1–20, tỷ lệ khẩu phần, non-scalable, rounding, giữ nguyên gốc",
        "RecipeLogic.scaleIngredients, detail.html",
    ),
    (
        "08",
        "Collections",
        "4 bộ sưu tập có data binding và link detail",
        "collections.html, recipes.json",
    ),
    (
        "09",
        "Favourites",
        "Unique IDs, Local Storage, restore, remove, empty và warning",
        "SavedData, favourites.html",
    ),
    ("10", "About", "Mục đích, quy trình, giả định, sample content và credits", "about.html"),
    (
        "11",
        "Contact",
        "Required name/email/message, email format, lỗi từng ô, demo confirmation/reset",
        "contact.html, ContactController",
    ),
    (
        "12",
        "Navigation",
        "Header/footer, active section, back link, menu mobile, focus, hash deep links",
        "index.html, route config, styles.css",
    ),
    (
        "13",
        "Planner",
        "7 ngày × 3 bữa, add/change/remove, servings, count bằng iteration, restore",
        "planner.html, PlannerController, SavedData",
    ),
    (
        "14",
        "Programming logic",
        "Module/controllers/services/directives, arrays/objects/functions, pseudocode, flowcharts, tests",
        "js/, tests/, báo cáo này",
    ),
]
mapping = "".join(
    "<tr>" + "".join(f"<td>{escape(x)}</td>" for x in row) + "</tr>" for row in requirements
)

tests = [
    ("Calculator 1 người", "180 g / 2 × 1", "90 g", "Đạt UI + unit"),
    ("Calculator 6 người", "180 g / 2 × 6", "540 g", "Đạt UI + unit"),
    ("Calculator 20 người", "180 g / 2 × 20", "1800 g", "Đạt UI + unit"),
    ("Calculator invalid", "0, 21, 1.5, trống", "Báo lỗi và ẩn lượng mới", "Đạt UI + unit"),
    ("Rounding", "1 tsp / 3 × 2", "0.67 tsp", "Đạt unit"),
    ("Non-scalable", "Salt to taste, 20 người", "Giữ nguyên To taste", "Đạt UI + unit"),
    (
        "Combined filters",
        "basil + Italian + Breakfast + 15 min + Vegan",
        "1 bruschetta",
        "Đạt UI + unit",
    ),
    ("No results", "nothing-xyz-999", "Empty message + clear action", "Đạt UI"),
    ("Filter persistence", "Mở detail rồi back", "Giữ mọi filter", "Đạt UI"),
    ("Favourites persistence", "Save rồi reload", "Khôi phục 1 ID", "Đạt UI + service"),
    (
        "Duplicate / unknown ID",
        "ID trùng + ID không tồn tại",
        "Giữ ID hợp lệ duy nhất",
        "Đạt unit + service",
    ),
    (
        "Planner persistence",
        "2 slots rồi reload",
        "Khôi phục 2 bữa đúng servings",
        "Đạt UI + service",
    ),
    ("Planner edit / remove", "Đổi 3→1, xóa bữa thứ hai", "1 bữa, 1 serving", "Đạt UI + service"),
    (
        "Unsave planned recipe",
        "Bỏ tim món đã lên lịch",
        "Planner giữ món, favourites rỗng",
        "Đạt UI + unit",
    ),
    (
        "Malformed JSON / storage denied",
        "JSON lỗi / mock getItem,setItem throw",
        "Warning và memory fallback",
        "Đạt service test",
    ),
    (
        "Contact invalid / valid",
        "Trống, bad-email, rồi valid",
        "Lỗi từng ô, demo confirmation",
        "Đạt UI",
    ),
    ("Contact reset", "Reset sau success", "Xóa dữ liệu và trạng thái form", "Đạt UI"),
    ("Gallery keyboard", "Next, ArrowRight, Escape", "Chuyển ảnh, đóng, trả focus", "Đạt UI"),
    (
        "Responsive",
        "11 route × 360/768/1280",
        "Không overflow, ảnh không lỗi",
        "Đạt DOM measurement",
    ),
    ("Second desktop browser", "Bộ UI tests toàn bộ", "Ghi version và result", "Chưa thực hiện"),
    (
        "Video demonstration",
        "Theo kịch bản 5–7 phút",
        "Video trình bày chức năng",
        "Chưa quay; có kịch bản",
    ),
]
test_rows = "".join(
    "<tr>" + "".join(f"<td>{escape(x)}</td>" for x in row) + "</tr>" for row in tests
)

calculator = """FUNCTION validServings(n)
  RETURN n is NUMBER AND integer AND 1 <= n <= 20

FUNCTION scaleIngredients(recipe, requested)
  IF NOT validServings(requested) THEN return validation error
  result = empty ARRAY
  FOR EACH ingredient IN recipe.ingredients
    copy = new OBJECT copied from ingredient
    IF ingredient.scalable != FALSE
      copy.quantity = ROUND(ingredient.quantity * requested / recipe.servings, 2)
    ELSE keep original quantity and non-scalable note
    APPEND copy TO result
  RETURN result
  // Original recipe and its ingredient objects are not modified."""
search = """FUNCTION filterRecipes(recipes, filters)
  query = LOWERCASE(TRIM(filters.query))
  matches = empty ARRAY
  FOR EACH recipe IN recipes
    keywordMatch = query appears in LOWERCASE(name + description + keywords)
    IF keywordMatch AND cuisineMatch AND mealMatch AND timeMatch AND dietMatch
      APPEND recipe TO matches
  SORT a copied matches array by A-Z, Z-A, or total minutes
  RETURN matches
  // An empty filter matches all values. Time uses <=. No matches yields []."""
validation = """ON CONTACT SUBMIT
  mark form submitted
  IF name blank OR email blank/invalid OR message blank
    show errors for invalid fields
    do not confirm
  ELSE show a local demonstration confirmation
  // Do not send or save contact details.

ON RESET
  clear fields and confirmation
  set form pristine and untouched"""
planner = """ON STARTUP
  TRY parse Local Storage JSON; CATCH -> warn, use defaults
  remove duplicate/unknown favourite IDs
  FOR EACH stored meal slot
    IF slot is valid AND recipe exists AND servings is integer 1..20
      retain a new {recipeId, servings} record

ON SAVE SLOT(key, recipeId, servings)
  IF invalid slot/recipe/servings THEN report error, keep existing plan
  ELSE plan[key] = {recipeId, servings}
  TRY save JSON; CATCH -> show memory-only warning

ON REMOVE SLOT(key)
  delete plan[key]; attempt save

FUNCTION countMeals(plan)
  total = 0
  FOR EACH own key IN plan: total = total + 1
  RETURN total"""

charts = flow(
    "Calculator flowchart",
    [
        "Start with recipe and requested servings",
        "Whole number 1 to 20? | No: show error and stop; Yes: continue",
        "For each ingredient: scalable? | No: keep note; Yes: quantity × requested ÷ base",
        "Round to 2 decimals; retain unit | Append a new object to results",
        "Display results without modifying original recipe",
    ],
)
charts += flow(
    "Search and filtering flowchart",
    [
        "Read keyword and filters",
        "Trim and lowercase query",
        "Loop through recipe records",
        "All active conditions match? | Yes: append; No: skip record",
        "Sort matches and count results",
        "Matches empty? | Yes: show empty state; No: show cards",
    ],
)
charts += flow(
    "Contact validation flowchart",
    [
        "Read form fields on submit",
        "Required fields complete and email valid?",
        "No: show errors after interaction | Yes: show demonstration confirmation",
        "Reset? Clear input and form state | No delivery and no persistence",
    ],
)
charts += flow(
    "Planner flowchart",
    [
        "Load saved JSON with error handling",
        "Validate slot, ID and integer servings | Discard invalid records",
        "User selects add, change or remove",
        "Valid save? Replace one slot | Invalid: show error, keep previous plan",
        "Attempt Local Storage write | Failure: warn and continue in memory",
        "Loop through valid slots and display total",
    ],
)

content = f"""<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>RecipeNest Project Report</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#f4f2ec;color:#26392b;font:15px/1.8 'Segoe UI',Arial,sans-serif}}main{{max-width:1080px;padding:65px 60px;background:white;margin:35px auto}}h1,h2,h3{{line-height:1.2}}h1{{font:46px/1.15 Georgia,serif;margin:10px 0 20px}}h2{{font:30px/1.25 Georgia,serif;margin:46px 0 20px}}h3{{font-size:18px;margin-top:28px}}p{{margin:0 0 18px}}.kicker{{font-size:11px;letter-spacing:2px;color:#a3442c;font-weight:bold}}.lead{{font-size:19px;color:#5a6b5c}}nav{{padding:20px;background:#edf1e6;margin:30px 0}}nav a{{display:inline-block;margin:5px 17px 5px 0;color:#52623e}}table{{width:100%;border-collapse:collapse;font-size:12px;margin:20px 0}}th,td{{text-align:left;padding:12px 11px;border:1px solid #d5ddce;vertical-align:top;overflow-wrap:anywhere}}th{{background:#e6ecdf;font-weight:600}}tr:nth-child(even){{background:#fafbf7}}pre{{white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f4ec;padding:22px;font:12px/1.85 Consolas,monospace;border-radius:5px}}code{{font-family:Consolas,monospace;font-size:.9em}}.note{{padding:20px 24px;background:#f7eddf;border-left:4px solid #b7472c;margin:25px 0}}figure{{margin:25px 0}}figure img{{max-width:100%;height:auto;border:1px solid #d8ddce}}figcaption{{font-size:12px;color:#5e6a57;margin:10px 0}}.screens{{display:grid;grid-template-columns:1fr 1fr;gap:25px;align-items:start}}.screens figure{{margin:0}}.screens .mobile img{{max-height:700px;object-fit:contain;object-position:top;width:100%}}.flow{{max-width:620px;margin:25px auto}}.flow svg{{width:100%;height:auto}}.flow figcaption{{text-align:center;font-weight:600}}a{{color:#a3442c}}.table-scroll{{overflow:auto}}.badge{{display:inline-block;padding:7px 13px;background:#e6ecdf;margin:5px 10px 5px 0;border-radius:4px;font-size:12px}}@media(max-width:700px){{main{{margin:0;padding:30px 20px}}h1{{font-size:36px}}.screens{{grid-template-columns:1fr}}th,td{{padding:8px;font-size:10px}}}}@media print{{body{{background:white}}main{{padding:0;margin:0;max-width:none}}nav{{display:none}}h2,h3{{break-after:avoid}}figure,tr,pre{{break-inside:avoid}}.screens .mobile img{{max-height:230mm}}figure img{{max-height:230mm;width:100%;object-fit:contain}}a{{color:inherit}}}}@page{{size:A4;margin:18mm}}
</style></head><body><main>
<p class="kicker">ANGULARJS WEBSITE DEVELOPMENT · 31 OCTOBER 2026</p><h1>RecipeNest Project Report</h1><p class="lead">Website khám phá công thức nấu ăn và lập kế hoạch bữa ăn</p><p>Báo cáo giải thích cách triển khai phần Problem Statement và Functional Requirement Specification trong đề RecipeNest, cấu trúc mã nguồn, thuật toán, giả định và các kết quả kiểm thử đã thực hiện. Dự án chạy hoàn toàn ở phía trình duyệt; có máy chủ static local để phục vụ file.</p><span class="badge">24 recipes</span><span class="badge">6 cuisines</span><span class="badge">33 automated tests passed</span><span class="badge">360 / 768 / 1280 px</span>
<nav><a href="#problem">Bài toán</a><a href="#design">Thiết kế</a><a href="#requirements">Đối chiếu yêu cầu</a><a href="#algorithms">Thuật toán</a><a href="#tests">Kiểm thử</a><a href="#screens">Ảnh chụp</a><a href="#startup">Chạy dự án</a></nav>
<h2 id="problem">1 Problem definition</h2><p>Người nấu ăn phải tìm công thức ở nhiều nơi, khó ghi nhớ món thích, điều chỉnh lượng nguyên liệu và tổ chức bữa ăn. RecipeNest gom các thao tác đó thành một cổng tra cứu: khám phá món, đọc chi tiết, chọn khẩu phần, lưu yêu thích và đưa vào lịch ăn 7 ngày.</p><p>Đối tượng sử dụng là người nấu ăn tại nhà. Dữ liệu gồm 24 công thức mẫu, 3 contributor hư cấu và 4 collection. Website không có đăng nhập, cơ sở dữ liệu backend, email delivery, giao dịch hay tích hợp dịch vụ trực tuyến.</p>
<h2 id="design">2 Design specifications</h2><h3>Visual and responsive design</h3><p>Tông nền kem, đỏ đất và xanh lá; serif cho tiêu đề, sans-serif cho nội dung; card ảnh món ăn và khoảng trắng rõ ràng. Desktop dùng lưới nhiều cột, tablet giảm số cột, mobile chuyển về bố cục dọc và menu mở/đóng. Planner hiển thị ngày theo hàng trên desktop và thành card trên mobile.</p><h3>Site navigation</h3><pre>Home → Recipes → Recipe detail → Calculator / Favourite / Planner
Home → Collections → Recipe detail
Footer → Contributors → Contributor detail → Associated recipes
Footer → Gallery → Preview / Recipe detail
Header → Favourites / Planner / About
Footer → Contact</pre><h3>AngularJS architecture</h3><table><tr><th>Layer</th><th>Responsibility</th></tr><tr><td>Module recipeNest</td><td>Depends on ngRoute; routes use hashbang #! for refreshable static deep links.</td></tr><tr><td>Catalogue service</td><td>Loads data/recipes.json, finds recipes by stable ID, keeps filters during detail navigation.</td></tr><tr><td>SavedData service</td><td>Shares favourites and plan across views, validates loaded data, handles persistence and warnings.</td></tr><tr><td>BrowserStorage adapter</td><td>Delegates getItem/setItem to Local Storage; injectable for failure tests.</td></tr><tr><td>Controllers</td><td>Shell, Home, Catalogue, Detail, Favourites, Collections, Profile, Planner, Gallery, Contact.</td></tr><tr><td>Directives</td><td>recipeCard reuses card template; modalKeys handles Escape, focus trap, gallery arrows.</td></tr><tr><td>Pure logic</td><td>Named functions with parameters and return values for validation, scaling, searching, cleaning and totals.</td></tr></table>
<h3>Data model</h3><pre>Recipe {{ id, name, cuisine, meal, minutes, servings, tags[], allergens[],
  contributorId, description, ingredients[], steps[], notes, keywords[],
  image, imageAlt, imageCredit, imageSource }}
Ingredient {{ name, quantity, unit, scalable, note? }}
Contributor {{ id, name, firstName, initials, colour, speciality,
  background, bio, interests[] }}
Collection {{ id, name, description, recipeIds[], image }}
Favourites = unique array of valid Recipe IDs
Plan = {{ "0-Breakfast": {{recipeId, servings}}, ... "6-Dinner": ... }}</pre>
<h3>Assumptions and boundaries</h3><p>Servings là số nguyên từ 1 đến 20. Công thức gốc không thay đổi khi tính lượng mới. Giữ nguyên đơn vị, làm tròn 2 chữ số; nguyên liệu “to taste” không nhân. Một số nguyên liệu đếm được có thể ra số lẻ; đó là ước tính toán học. Tổng thời gian là ước tính cho món, không tự nhân theo khẩu phần.</p><p>Planner có 21 ô thuộc tuần mẫu Monday–Sunday, mỗi ô giữ đúng một recipe ID và số khẩu phần. Bỏ favourite không xóa planner. Local Storage chỉ lưu ID và khẩu phần; contact message không lưu. Dữ liệu mẫu không đảm bảo dietary suitability; ảnh minh họa có thể không trùng món chính xác.</p>
<h2 id="requirements">3 Functional requirement mapping</h2><div class="table-scroll"><table><thead><tr><th>No</th><th>Requirement</th><th>Implemented behaviour</th><th>Location</th></tr></thead><tbody>{mapping}</tbody></table></div>
<h2 id="algorithms">4 Pseudocode and flowcharts</h2><p>Selection statements kiểm tra điều kiện, iteration duyệt công thức/nguyên liệu/ô lịch, arrays giữ danh sách và objects biểu diễn record. Các hàm không thay đổi dataset gốc; dữ liệu người dùng được hiển thị như text bằng AngularJS interpolation.</p><h3>Serving quantity calculator</h3><pre>{escape(calculator)}</pre>{charts.split('<figure')[0] if False else ''}{flow('Calculator flowchart',['Start with recipe and requested servings','Whole number 1 to 20? | No: show error and stop; Yes: continue','Loop ingredients: scalable? | Yes: calculate ratio; No: preserve note','Round to 2 decimals and retain unit','Return new ingredient array; display results'])}
<h3>Search filtering and sorting</h3><pre>{escape(search)}</pre>{flow('Search and filtering flowchart',['Read keyword and active filters','Trim and lowercase query; loop all recipes','All active conditions match? | Yes: append to results; No: skip','Sort results and count records','Empty? Show no-match state | Otherwise render recipe cards'])}
<h3>Contact form validation</h3><pre>{escape(validation)}</pre>{flow('Contact validation flowchart',['User submits contact form','Required fields complete and email valid?','No: show field-level errors | Yes: show demo confirmation','Reset clears input and form state | No email sent and no data stored'])}
<h3>Personal planner and persistence</h3><pre>{escape(planner)}</pre>{flow('Planner flowchart',['Read JSON; catch errors and validate saved records','User selects add, change or remove','Slot, ID and servings valid? | No: show error; Yes: replace one slot','Attempt persistence | Write fails: warn, keep memory state','Loop valid slots; display planned meal count'])}
<h2 id="tests">5 Test cases and actual results</h2><p>Ngày kiểm tra 31/10/2026. Runtime Node.js 24.19.0; AngularJS/route 1.8.2. Browser trong ứng dụng báo Chrome/156.0.0.0 trên Windows NT 10.0. Chạy <code>npm test</code> đạt 33/33. Các test service dùng mock storage để kiểm tra đường lỗi, không thay đổi cài đặt bảo mật của trình duyệt.</p><div class="table-scroll"><table><tr><th>Test</th><th>Input</th><th>Expected</th><th>Actual</th></tr>{test_rows}</table></div><p>11 route được đo ở 360, 768 và 1280 px, không có horizontal overflow. Chiều rộng nội dung lần lượt 345, 753, 1265 px vì có thanh cuộn dọc. Chi tiết từng lượt nằm trong <a href="viewport-checks.json">viewport-checks.json</a>; mô tả đầy đủ trong <a href="TEST-RESULTS.md">TEST-RESULTS.md</a>.</p><div class="note"><b>Verification still required for submission</b><p>Chưa kiểm thử đầy đủ trên một trình duyệt desktop độc lập thứ hai, thiết bị mobile thật hoặc screen reader. Video demo chưa được quay. Các hạng mục này không được ghi là Passed; có hướng dẫn thử và kịch bản quay trong bộ ZIP.</p></div>
<h2 id="screens">6 Application screenshots</h2><p>Ảnh chụp từ bản chạy thực tế qua HTTP. Dữ liệu lịch ăn trong ảnh là dữ liệu thử của phiên kiểm tra, không phải dữ liệu mặc định cấp sẵn cho người dùng.</p><figure><img src="home-desktop.png" alt="RecipeNest homepage at desktop width"><figcaption>Home page at 1280 px; local food assets, featured cards, collections and planner introduction.</figcaption></figure><figure><img src="catalogue-filters.png" alt="Combined catalogue filters returning one recipe"><figcaption>Search and all four filters return one matching bruschetta recipe.</figcaption></figure><figure><img src="detail-calculator.png" alt="Recipe details and serving calculator"><figcaption>Recipe details with six-serving ingredient quantities, base data, notes and related recipes.</figcaption></figure><figure><img src="planner-desktop.png" alt="Meal planner with two meals"><figcaption>Desktop planner after saving two meals and reloading.</figcaption></figure><figure><img src="contact-validation.png" alt="Contact form with a local demonstration confirmation"><figcaption>Valid input produces an explicit demonstration confirmation with no delivery.</figcaption></figure><div class="screens"><figure class="mobile"><img src="home-mobile.png" alt="Home page on a mobile viewport"><figcaption>Mobile home at 360 px.</figcaption></figure><figure class="mobile"><img src="planner-mobile.png" alt="Meal planner on a mobile viewport"><figcaption>Mobile planner at 360 px, days stacked vertically.</figcaption></figure></div>
<h2 id="startup">7 Prerequisites and startup</h2><p>Giải nén toàn bộ ZIP. Cần Node.js 18+ hoặc Python 3, một trình duyệt hiện đại và editor nếu muốn chỉnh code. Không cần npm install hay kết nối Internet khi chạy bản đã giải nén. Nhấp đôi START-WINDOWS.bat hoặc chạy một lệnh bên dưới trong thư mục gốc RecipeNest.</p><pre>node server.js
# Or
python -m http.server 4175 --bind 127.0.0.1

# Open http://127.0.0.1:4175
# Test with Node
npm test</pre><p>Không dùng file:// vì AngularJS tải templates và JSON qua HTTP. Hashbang routing cho phép refresh link chi tiết trên static server. Đổi cổng bằng biến môi trường PORT cho Node nếu cần.</p><h3>Reset browser data</h3><p>Xóa 2 khóa <code>recipenest.favourites.v1</code> và <code>recipenest.plan.v1</code> trong DevTools → Application/Storage → Local Storage của địa chỉ dự án, sau đó reload. Hoặc dùng tính năng xóa dữ liệu trang của trình duyệt. Địa chỉ/cổng khác sẽ có vùng dữ liệu riêng.</p>
<h2>8 Assets dependencies and handover</h2><p>Ảnh được cung cấp bởi Unsplash, lưu trong assets/images. Nguồn ảnh chi tiết tại <a href="../assets/CREDITS.md">assets/CREDITS.md</a>. Ảnh chỉ minh họa loại món hoặc thành phần và một số ảnh được dùng lại. AngularJS/route 1.8.2 lấy từ <a href="https://code.angularjs.org/1.8.2/">nguồn AngularJS</a>, kèm giấy phép MIT. Giao diện và favicon được tạo cho dự án. Mọi contributor là hư cấu.</p><p>Bộ nộp gồm source HTML/CSS/JavaScript/AngularJS, templates, JSON, ảnh local, thư viện, startup script, test source, báo cáo này, kết quả thử, screenshot và kịch bản demo. Có README.md tiếng Việt và ReadMe.doc dạng RTF mở bằng Word. Video cần người nộp tự quay theo <a href="DEMO-GUIDE.md">DEMO-GUIDE.md</a>. Hosting là tùy chọn và không nằm trong bản ZIP local này.</p></main></body></html>"""
(DOCS / "PROJECT-REPORT.html").write_text(content, encoding="utf-8")

# RTF is detected natively by Word even when using the assignment's requested .doc name.
guide = [
    ("title", "RecipeNest Startup Guide"),
    (
        "p",
        "Recipe discovery and meal planning website using AngularJS 1.8.2. This guide covers local startup, assumptions, dependencies, architecture and resetting saved data.",
    ),
    ("h", "Prerequisites"),
    (
        "p",
        "Use Windows, Node.js 18 or later OR Python 3, and a modern browser. No npm install or Internet connection is needed for the supplied ZIP. All images and framework scripts are local.",
    ),
    ("h", "Startup"),
    (
        "p",
        "1. Extract the whole ZIP and keep every subfolder.\n2. Double-click START-WINDOWS.bat, or run node server.js from this folder.\n3. Open http://127.0.0.1:4175 in the browser.\n4. Keep the server window open. Press Ctrl+C to stop.\nAlternative: python -m http.server 4175 --bind 127.0.0.1\nDo not open index.html through file://; templates and JSON require HTTP.",
    ),
    ("h", "Scope and assumptions"),
    (
        "p",
        "This is a front-end educational application. No login, backend database, real transactions or email delivery. Recipes, dietary tags and declared allergens are sample data, and profiles are fictional. Images are illustrative and may differ from the exact dish. The planner is a Monday-Sunday sample week, with breakfast, lunch and dinner slots.",
    ),
    ("h", "Calculator"),
    (
        "p",
        "Enter a whole number of servings from 1 to 20. New amount = original amount x requested servings / base servings, rounded to two decimals. Units stay unchanged. To-taste ingredients do not scale. Preparation time does not scale. Fractional counts of whole ingredients are mathematical estimates.",
    ),
    ("h", "Module controllers and services"),
    (
        "p",
        "recipeNest depends on ngRoute. Catalogue loads JSON and retains catalogue filters. SavedData shares and persists favourites and the meal plan; BrowserStorage delegates to Local Storage. Controllers manage each screen. recipeCard shares a card template, while modalKeys supports accessible preview/editor controls. js/logic.js contains pure validation, calculation, filtering and restore functions.",
    ),
    ("h", "Persistence and reset"),
    (
        "p",
        "Only recipe IDs and serving counts are saved in this browser. Removing a favourite does not remove its planned meals. If storage fails, a warning appears and changes continue in memory. To reset, delete recipenest.favourites.v1 and recipenest.plan.v1 in browser DevTools under Application or Storage, then reload. Contact messages are neither sent nor saved.",
    ),
    ("h", "Dependencies and credits"),
    (
        "p",
        "AngularJS and angular-route 1.8.2 are bundled from code.angularjs.org under MIT; see assets/vendor/ANGULAR-LICENSE.txt. Food images: Unsplash; original URLs and acknowledgements are in assets/CREDITS.md. Interface and favicon are original project assets. Node.js is used only for an optional static server and tests.",
    ),
    ("h", "Testing and project report"),
    (
        "p",
        "Run npm test: 33 automated tests pass with Node.js 24.19.0. Open docs/PROJECT-REPORT.html for requirements, algorithms, flowcharts, test cases and screenshots. Read docs/TEST-RESULTS.md for actual browser checks and remaining verification. A second independent desktop browser and real mobile device still need confirmation before formal submission. docs/DEMO-GUIDE.md contains a video recording script; no demo video is included.",
    ),
    ("h", "Vietnamese instructions"),
    (
        "p",
        "See README.md in the root folder for the complete Vietnamese guide. This ReadMe.doc contains RTF content readable by Microsoft Word. It is not a binary Word 97 document.",
    ),
]


def rtf_escape(text):
    return (
        text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}").replace("\n", "\\line ")
    )


rtf = [
    r"{\rtf1\ansi\deff0{\fonttbl{\f0\fswiss Arial;}}\paperw11906\paperh16838\margl1134\margr1134\margt1134\margb1134\f0\fs22"
]
for kind, text in guide:
    if kind == "title":
        rtf.append(r"\pard\sa240\fs36\b " + rtf_escape(text) + r"\b0\fs22\par")
    elif kind == "h":
        rtf.append(r"\pard\keepn\sb180\sa80\b " + rtf_escape(text) + r"\b0\par")
    else:
        rtf.append(r"\pard\sa140\sl280\slmult1 " + rtf_escape(text) + r"\par")
rtf.append("}")
(ROOT / "ReadMe.doc").write_text("".join(rtf), encoding="ascii")
print("Created PROJECT-REPORT.html and ReadMe.doc (RTF).")

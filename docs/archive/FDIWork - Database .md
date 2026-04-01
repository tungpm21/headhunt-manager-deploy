## **Thiết kế Database cho hệ thống ATS Headhunt** 

# **1\. Mục tiêu**

Xây dựng cấu trúc database để phục vụ hệ thống ATS (Applicant Tracking System) cho công ty FDIWork

Database cần hỗ trợ các chức năng chính:

* quản lý database ứng viên (Talent Pool)  
* quản lý danh sách job  
* quản lý danh sách client  
* quản lý ứng viên gửi cho job (submission)  
* theo dõi pipeline tuyển dụng, trạng thái ứng viên 

Yêu cầu hệ thống:

* đơn giản để vận hành  
* dễ mở rộng  
* dễ tích hợp với website job board

---

# **2\. Kiến trúc Database**

Hệ thống sử dụng **3 bảng chính**:

| Candidates | Quan hệ giữa các bảng: Clients → Jobs → Submissions → Candidates Giải thích: Candidates: database ứng viên Jobs: danh sách job tuyển dụng Clients: danh sách doanh nghiệp sử dụng dịch vụ tuyển dụng Submissions: bảng liên kết ứng viên với job và theo dõi trạng thái tuyển dụng. |
| :---- | :---- |
| Jobs |  |
| Submissions |  |
| Clients |  |

\`

# **3\. Bảng Candidates (Talent Pool)**

## **Mục đích**

Lưu trữ thông tin hồ sơ ứng viên và tạo **database talent pool** phục vụ cho hoạt động headhunt.

| Field Name | Type | Description |
| ----- | ----- | ----- |
| Candidate ID | Auto Number | mã định danh ứng viên |
| Name | Text | họ tên ứng viên |
| Phone | Phone | số điện thoại |
| Email | Email | email |
| Location | Text | nơi sinh sống / làm việc |
| Current Company | Text | công ty hiện tại |
| Current Position | Text | vị trí hiện tại |
| Years of Experience | Number | số năm kinh nghiệm |
| Skills | Multi-select | kỹ năng chính |
| Industry | Multi-select | ngành nghề |
| Level | Single-select | cấp độ ứng viên |
| CV | Attachment | file CV |
| Source | Single-select | nguồn ứng viên |
| Status | Single-select | trạng thái ứng viên |
| Recruiter | User | recruiter phụ trách |
| Notes | Long Text | ghi chú |

## **Candidate Status**

* **New**: ứng viên mới nhập vào hệ thống  
* **Screening**: đang đánh giá hồ sơ  
* **Qualified**: ứng viên phù hợp  
* **Talent Pool**: lưu trong database để sử dụng sau  
* **Blacklisted**: ứng viên không phù hợp

💡 Quan trọng: **Candidate Status không phản ánh kết quả tuyển dụng.**

# **4\. Bảng Jobs**

## **Mục đích**

**Quản lý danh sách job tuyển dụng từ:**

* **Job đăng trên website**

| Field Name | Type | Description |
| ----- | ----- | ----- |
| Job ID | Auto Number | mã job |
| Job Title | Text | tên vị trí |
| Client Name | Text | công ty tuyển dụng |
| Industry | Text | ngành nghề |
| Location | Text | địa điểm làm việc |
| Salary Range | Text | mức lương |
| Required Skills | Multi-select | kỹ năng yêu cầu |
| Experience Required | Number | số năm kinh nghiệm |
| Recruiter | User | recruiter phụ trách |
| Priority | Single-select | mức độ ưu tiên |
| Status | Single-select | trạng thái job |
| Job Description | Attachment / Long Text | mô tả công việc |
| Open Date | Date | ngày mở job |
| Notes | Long Text | ghi chú |

## **Job Status**

* **Open:** job đang tuyển  
* **On hold:** tạm dừng tuyển  
* **Closed:** job đã đóng 

# **5\. Bảng Submissions**

## **Mục đích**

**Quản lý việc gửi ứng viên cho job và theo dõi pipeline tuyển dụng.**

**Đây là bảng liên kết giữa:**

* **Candidates**  
* **Jobs**

| Field Name | Type | Description |
| ----- | ----- | ----- |
| Submission ID | Auto Number | mã submission |
| Candidate | Link to Candidates | ứng viên |
| Job | Link to Jobs | job |
| Client Name | Lookup | công ty tuyển dụng |
| Submission Date | Date | ngày gửi CV |
| Status | Single-select | trạng thái pipeline |
| Interview Date | Date | ngày phỏng vấn |
| Result | Single-select | kết quả |
| Feedback | Long Text | feedback từ client |
| Recruiter | Lookup | recruiter phụ trách |

## **Submission Status**

* **Sent to client:** đã gửi CV  
* **Client reviewing:** khách hàng đang xem CV  
* **Interview:** ứng viên đang phỏng vấn  
* **Final interview:** vòng cuối  
* **Offer:** đã nhận offer  
* **Rejected:** bị từ chối  
* **Hired:** tuyển thành công 

# **6\. Bảng Clients**

| Field | Type | Description |
| ----- | ----- | ----- |
| Client ID | ID | mã định danh khách hàng |
| Company Name | Text | tên công ty |
| Industry | Select | lĩnh vực |
| Company Size | Select | quy mô |
| Location | Text | địa điểm |
| Website | URL | website công ty |
| Status | Select | trạng thái khách hàng |
| Created Date | Date | ngày tạo |

## **Client Status**

* Active:	khách hàng đang sử dụng dịch vụ  
* Inactive: khách hàng đã ngừng hợp tác  
* Blacklisted: không hợp tác

# **7\. Quan hệ dữ liệu**

**Clients → Jobs**  
 Một **Client** có thể có **nhiều Job tuyển dụng**.

**Jobs → Submissions**  
 Một **Job** có thể có **nhiều Candidate được gửi**.

**Candidates → Submissions**  
 Một **Candidate** có thể được gửi cho **nhiều Job khác nhau**.

Do đó, bảng **Submissions** được sử dụng làm **bảng trung gian** để liên kết Candidate và Job, đồng thời theo dõi trạng thái tuyển dụng.

### 

### 

### **Mô hình dữ liệu**

Clients

   │

   │

Jobs

   │

   │

Submissions

   │

   │

Candidates

---

# **8\. Quy tắc dữ liệu**

## **1\. Candidate phải có thông tin liên hệ**

Mỗi **Candidate** phải có ít nhất một trong hai thông tin sau:

* Email  
* Phone number

Quy tắc này giúp tránh tạo record ứng viên **không có thông tin liên hệ**.

---

## **2\. Client phải có tên công ty**

Mỗi **Client** phải có **Company Name**.

Điều này giúp tránh tạo các record khách hàng **không xác định rõ doanh nghiệp**.

---

## **3\. Job phải có Job ID duy nhất**

Mỗi **Job** phải có **Job ID duy nhất (Unique Job ID)**.

Mục đích:

* tránh tạo job trùng lặp  
* đảm bảo dữ liệu ổn định khi **sync với website tuyển dụng**

---

## **4\. Không được trùng Candidate – Job trong Submissions**

Một **Candidate** có thể được gửi cho nhiều **Job khác nhau**.

Tuy nhiên, trong bảng **Submissions**:

Candidate ID \+ Job ID phải là **duy nhất**.

Điều này có nghĩa:

* một ứng viên **không thể được gửi cho cùng một job nhiều lần**.

---

## **5\. Không tạo Candidate trùng**

Khi tạo Candidate mới, hệ thống cần kiểm tra:

Email hoặc Phone đã tồn tại trong database hay chưa để tránh **duplicate candidate**. Nếu đã tồn tại sẽ gợi ý merge (ghi đè thông tin mới nhất / update thủ công).


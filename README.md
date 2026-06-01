# Team Website Project

Chào mừng các bạn đến với dự án Team Website!

Dưới đây là hướng dẫn chi tiết về quy trình làm việc nhóm với Git và GitHub để đảm bảo code không bị xung đột và dự án luôn ổn định.

## 🌳 Cấu trúc nhánh (Branching Model)

Dự án của chúng ta sẽ tuân theo cấu trúc nhánh sau:

1. **Nhánh `main` (hoặc `master`)**:
   - Đây là nhánh chứa code **khởi tạo sạch nhất** và **hoàn thiện nhất**.
   - Code trên nhánh này luôn trong trạng thái **sẵn sàng để chạy (deploy)**.
   - ⚠️ **Quy tắc Tối thượng**: Tuyệt đối **KHÔNG AI** được code trực tiếp hay push thẳng (trực tiếp) lên nhánh `main`.

2. **Nhánh `dev` (hoặc `develop`)**:
   - Nhánh này được tạo ra từ `main`.
   - Đây là **nhánh trung gian**, nơi hội tụ code của tất cả các thành viên.
   - Khi mỗi người làm xong một tính năng, code sẽ được gộp (merge) vào nhánh `dev` này để test chung xem các tính năng có hoạt động tốt cùng nhau hay có xung đột (conflict) gì không.

3. **Nhánh cá nhân / tính năng (Feature Branches)**:
   - Từ nhánh `dev`, mỗi người sẽ tự tạo một nhánh riêng để làm phần việc của mình.
   - 📌 **Quy tắc đặt tên**: Sử dụng tiền tố `feature/<tên-tính-năng>` hoặc `tên-người/<tên-tính-năng>`.
     - *Ví dụ*: `feature/login-page`, `an/header-component`, `binh/footer`.

---

## 🚀 Quy trình làm việc hàng ngày (Workflow)

Vui lòng làm theo các bước sau mỗi khi bạn bắt đầu một tính năng mới:

### Bước 1: Lấy code mới nhất về máy
Luôn luôn đảm bảo bạn đang ở nhánh `dev` và có code mới nhất trước khi tạo nhánh mới.
```bash
git checkout dev
git pull origin dev
```

### Bước 2: Tạo nhánh làm việc riêng
Tạo nhánh feature mới từ nhánh `dev` để bắt đầu code:
```bash
git checkout -b feature/ten-tinh-nang-cua-ban
```

### Bước 3: Code và Commit
Thực hiện các thay đổi trong code của bạn. Sau khi hoàn thành một phần việc, hãy commit lại:
```bash
git add .
git commit -m "Mô tả ngắn gọn về những gì bạn vừa làm"
```

### Bước 4: Đẩy nhánh cá nhân lên GitHub
Sau khi code xong, hãy đẩy nhánh của bạn lên GitHub:
```bash
git push origin feature/ten-tinh-nang-cua-ban
```

### Bước 5: Tạo Pull Request (PR)
1. Lên trang GitHub của dự án: https://github.com/asuna-chan123/Team-Website
2. Bạn sẽ thấy thông báo về nhánh vừa đẩy lên, bấm vào nút **Compare & pull request**.
3. **Quan trọng**: Chọn nhánh đích (base branch) là `dev` (không phải `main`).
4. Điền tiêu đề và mô tả cho PR của bạn.
5. Bấm **Create pull request**.

### Bước 6: Review và Gộp Code (Merge)
- Cả nhóm (hoặc trưởng nhóm) sẽ vào xem PR, đọc code và thảo luận nếu cần thiết.
- Nếu mọi thứ ổn định và không có lỗi (conflict), trưởng nhóm hoặc người được phân công sẽ bấm **Merge pull request** để gộp tính năng của bạn vào nhánh `dev`.

---

Chúc cả nhóm làm việc hiệu quả và thành công! 🚀

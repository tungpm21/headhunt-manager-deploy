# Huong Dan Import Du Lieu

## 1. Import Ung Vien

### File mau
`import-candidates-template.csv`

### Cot bat buoc
| Cot | Mo ta | Bat buoc? |
| --- | --- | --- |
| Ho va Ten | Ten day du ung vien | Co |
| Email | Email lien he | Khong |
| So Dien Thoai | SDT lien he | Khong |
| Khu Vuc | TP.HCM, Ha Noi, Da Nang... | Khong |
| Nganh Nghe | IT, Tai chinh, San xuat... | Khong |
| Vi Tri | Chuc danh hien tai | Khong |
| Cong Ty | Cong ty hien tai | Khong |

### Huong dan
1. Mo file CSV mau, thay data mau bang data can import va giu nguyen header.
2. Vao CRM -> `Nhap du lieu`.
3. Keo tha file CSV/Excel vao khu vuc `Import ung vien`.
4. Kiem tra preview -> xac nhan import.
5. He thong se tu dong skip trung lap theo email hoac SDT.

### Luu y
- Headers linh hoat: nhan ca tieng Viet va tieng Anh.
- Ho tro `.csv` UTF-8 va `.xlsx`.
- Nen import toi da 500 dong moi lan.

## 2. Import Khach Hang (Clients)

### File mau
`import-clients-template.csv`

### Quy mo cong ty
| Gia tri | Mo ta |
| --- | --- |
| SMALL | Duoi 50 nhan vien |
| MEDIUM | 50-200 nhan vien |
| LARGE | 200-1000 nhan vien |
| ENTERPRISE | Tren 1000 nhan vien |

### Huong dan
1. Mo file CSV mau, giu nguyen header va thay bang data can import.
2. Vao CRM -> `Nhap du lieu`.
3. Chon khu vuc `Import doanh nghiep`.
4. Preview file -> kiem tra cac dong bi trung hoac sai company size / website.
5. Xac nhan import.

### Luu y
- Cot `Ten Cong Ty` la bat buoc.
- Cot `Quy Mo` chi nhan: `SMALL`, `MEDIUM`, `LARGE`, `ENTERPRISE`.
- System tu dong skip dong trung theo `companyName` va `website`.
- Website neu co phai la URL hop le, vi du `https://example.com`.

## 3. Seed Data Cho Dev / Staging

Neu can verify nhanh bang template mau:

```bash
npx tsx scripts/verify-import-templates.ts
```

Script nay se:
- Doc `docs/templates/import-candidates-template.csv`
- Doc `docs/templates/import-clients-template.csv`
- Import vao database dev/staging bang user admin dau tien tim thay
- In ra tong so dong tao moi va tong so dong bi skip

# Dockerfile สำหรับ backend

# ใช้ Python เวอร์ชัน 3.8 ที่มีขนาดเบา
FROM python:3.9-slim

# ตั้งโฟลเดอร์ทำงานเป็น /app
WORKDIR /app

# คัดลอกไฟล์ทั้งหมดไปยัง /app ใน container
COPY . .

# ติดตั้ง dependencies ที่ระบุใน requirements.txt
RUN pip install -r requirements.txt

# รันแอปพลิเคชัน Python
CMD ["python", "app.py"]

# Dockerfile สำหรับ frontend

# ใช้ Node.js เวอร์ชัน 18 บน Alpine ซึ่งมีขนาดเบา
FROM node:22-alpine

# ตั้งโฟลเดอร์ทำงานเป็น /app
WORKDIR /app

# คัดลอกไฟล์ทั้งหมดไปยัง /app ใน container
COPY . .

# ติดตั้ง dependencies และสร้าง production build

RUN npm install

# รันเซิร์ฟเวอร์ Angular
CMD ["npm", "start"]

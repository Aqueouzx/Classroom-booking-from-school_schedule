from flask import Flask, render_template, jsonify, request
import pandas as pd
from datetime import datetime

app = Flask(__name__)

def load_schedule():
    # โหลดข้อมูลจาก CSV
    return pd.read_csv('C:/Users/opal/OneDrive/เดสก์ท็อป/ระบบจองห้องเรียน/ตารางเรียนสำหรับจองห้องเรียน.csv' , encoding='utf-8')

def check_availability():
    # โหลดข้อมูล
    schedule = load_schedule()

    # แปลงเวลาจากข้อความเป็น datetime
    now = datetime.now()
    schedule['เริ่ม'] = pd.to_datetime(schedule['เริ่ม'], format='%H:%M น.')
    schedule['สิ้นสุด'] = pd.to_datetime(schedule['สิ้นสุด'], format='%H:%M น.')

    # ตรวจสอบวันปัจจุบัน
    week = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
    today = week[now.weekday()]  # รับชื่อวันปัจจุบัน (เช่น "อังคาร")

    # ตรวจสอบห้องเรียน
    results = []
    for _, row in schedule.iterrows():
        if row['วัน'] == today:  # ตรวจสอบวันในตารางว่าเป็นวันเดียวกับวันนี้หรือไม่
            if row['เริ่ม'].time() <= now.time() <= row['สิ้นสุด'].time():
                results.append({
                    "ห้อง": row['ห้อง'],
                    "สถานะ": "ใช้งานไม่ได้",
                    "ชั้น": row['ชั้น'],
                    "วิชา": row['วิชา'],
                    "ช่วงเวลา": f"{row['เริ่ม'].strftime('%H:%M')} - {row['สิ้นสุด'].strftime('%H:%M')}"
                })
            else:
                results.append({
                    "ห้อง": row['ห้อง'],
                    "สถานะ": "ใช้งานได้"
                })
    return results

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/availability', methods=['GET'])
def get_availability():
    availability = check_availability()
    return jsonify(availability)

@app.route('/api/book', methods=['POST'])
def book_room():
    data = request.json
    room = data.get('room')
    user = data.get('user')
    return jsonify({"message": f"ห้อง {room} ถูกจองโดย {user} แล้ว!"})

if __name__ == '__main__':
    app.run(debug=True)

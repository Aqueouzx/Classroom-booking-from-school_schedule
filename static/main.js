// ฟังก์ชันสำหรับโหลดข้อมูลการจองห้อง
async function fetchAvailability() {
    try {
        // เรียก API เพื่อดึงข้อมูล
        const response = await fetch('/api/availability');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        // ตรวจสอบว่าองค์ประกอบใน DOM มีอยู่จริง
        const tableElement = document.getElementById('availability-table');
        if (!tableElement) throw new Error('Table element not found');
        const table = tableElement.querySelector('tbody');
        if (!table) throw new Error('Tbody element not found in table');

        // ล้างข้อมูลเก่า
        table.innerHTML = '';

        // ตรวจสอบว่ามีข้อมูลหรือไม่
        if (data.length === 0) {
            table.innerHTML = '<tr><td colspan="6">ไม่มีข้อมูลสำหรับการจอง</td></tr>';
            return;
        }

        // แสดงข้อมูลแต่ละแถว
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.ห้อง}</td>
                <td>${row.สถานะ}</td>
                <td>${row.ชั้น || '-'}</td>
                <td>${row.วิชา || '-'}</td>
                <td>${row.ช่วงเวลา || '-'}</td>
                <td>
                    ${row.สถานะ === "ใช้งานได้" ? `<button onclick="bookRoom('${row.ห้อง}')">จอง</button>` : '-'}
                </td>
            `;
            table.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
        alert('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
}

// ฟังก์ชันสำหรับจองห้องเรียน
async function bookRoom(room) {
    // ขอข้อมูลชื่อผู้ใช้
    const user = prompt("กรุณากรอกชื่อผู้ใช้:");
    if (!user) {
        alert("โปรดระบุชื่อผู้ใช้เพื่อจองห้อง");
        return;
    }

    try {
        // ส่งข้อมูลการจองไปยังเซิร์ฟเวอร์
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room, user })
        });
        if (!response.ok) throw new Error('Failed to book the room');

        const result = await response.json();
        alert(result.message);

        // โหลดข้อมูลใหม่เพื่อแสดงสถานะที่อัปเดต
        fetchAvailability();
    } catch (error) {
        console.error('Error booking room:', error);
        alert('ไม่สามารถจองห้องได้ กรุณาลองใหม่อีกครั้ง');
    }
}

// เรียกฟังก์ชัน fetchAvailability เมื่อหน้าเว็บโหลดเสร็จ
window.onload = fetchAvailability;

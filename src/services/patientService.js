import db from "../models/index"
require('dotenv').config()
import emailService from './emailService'
const { reject } = require("lodash")

let postBooking = (data) => {
    return new Promise(async (resolve, reject) => {
        try {//validate, nhập email
            if (!data.email || !data.doctorId || !data.timeType || !data.date) {
                resolve({
                    errCode: -1,
                    errMessage: 'Thiếu thông số cần thiết'
                })
            } else {
                //gửi email xác nhận bằng nodemailler
                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    patientName: 'Nguyen Van A',
                    time: '8:00 - 9:00 18/11/2021',
                    doctorName: 'Nguyen Tran Nhon'
                })
                //update hoặc insert patient
                let user = await db.User.findOrCreate({ //thực hiện tạo hoặc tìm user bằng email
                    where: { email: data.email },
                    defaults: { //nếu không có user thì thực hiện tạo user và gán role
                        email: data.email,
                        roleId: 'R3' //gán role cho patient
                    }
                });
                console.log('thong tin user: ', user[0])//vì hàm findOrCreate trả về 1 mảng nên muốn lấy giá trị id của patient thì phải lấy phần tử 0



                //tạo booking
                if (user) {
                    await db.Booking.create({
                        statusId: 'S1',
                        doctorId: data.doctorId,
                        patientId: user[0].id,
                        date: data.date,
                        timeType: data.timeType,
                    })
                }
                resolve({ //nếu có thì trả ra errcode
                    errCode: 0,
                    errMessage: 'Lưu thông tin bệnh nhân thành công'
                });
            }
        }
        catch (e) {
            reject(e);
        }
    })

}
module.exports = {
    postBooking: postBooking,
}
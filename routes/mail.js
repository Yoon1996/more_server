var express = require("express");
const nodemailer = require('nodemailer');
const senderInfo = require('../config/senderInfo.json');
const { getHash } = require("../util/password.util");
const User = require("../model/user.model");
var router = express.Router();
// 메일발송 객체
const mailSender = {
    // 메일발송 함수
    sendGmail: function (param) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',   // 메일 보내는 곳
            prot: 587,
            host: 'smtp.gmlail.com',
            secure: false,
            requireTLS: true,
            auth: {
                user: senderInfo.user,  // 보내는 메일의 주소
                pass: senderInfo.pass   // 보내는 메일의 비밀번호
            }
        });
        // 메일 옵션
        var mailOptions = {
            from: senderInfo.user, // 보내는 메일의 주소
            to: param.toEmail, // 수신할 이메일
            subject: param.subject, // 메일 제목
            text: param.text // 메일 내용
        };

        // 메일 발송    
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    }
}

router.post('/mail', async (req, res) => {
    try {
        const randomPw = Math.floor(Math.random() * 10000)
        const { email } = req.body;
        console.log('email: ', email);


        let emailParam = {
            toEmail: email,     // 수신할 이메일

            subject: '모두의 레시피에서 임시 비밀번호를 보내드립니다.',   // 메일 제목

            //메일 내용
            text:
                //임시 비밀번호 생성
                `임시 비밀번호 : ${randomPw}`

        };

        mailSender.sendGmail(emailParam);



        await User.update({ password: getHash(String(randomPw)) }, {
            where: {
                email: email,
            }
        })

        res.status(200).send("성공");
    }
    catch (err) {
        console.log('err: ', err);
    }
})

module.exports = mailSender;
module.exports = router;
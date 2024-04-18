const AWS = require('aws-sdk');
const multer = require('multer')
var express = require('express');
const fs = require('fs');
const { resolve } = require('path');
var router = express.Router();


// aws region 및 자격증명 설정
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2'
});

// s3 클라이언트 연결
const s3 = new AWS.S3();

// console.log("ㄴ3", s3.config.bucket.Bucket)

// 프로미스 기반 aws sdk api
// s3.listBuckets().promise().then((data) => {
//     console.log('S3 : ', JSON.stringify(data, null, 2));
// });

// const upload = multer({ dest: 'uploads/' })
//1.client 에서 서버로 요청
//2.서버에서 s3에 url요청
//3.s3에서 인증된 url 서버로 보내줌
//4.서버에서 client로 인증된 url 보내줌
//5.client 에서 서버로 url사용하여 데이터 전송
//6.서버에서 받은 데이터를 s3에 저장

router.post("/send-url", async (req, res) => {

    console.log(req.body.filename)
    const filename = req.body.filename

    const params = {
        Bucket: 'more-asset',
        Key: `/upload/${filename}`
    }
    console.log('params: ', params);


    try {
        const url = await new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', params, function (err, url) {
                if (err) {
                    reject(err)
                }
                resolve(url)
            })
        })
        res.json(url)
        return url
    }
    catch (err) {
        console.log('err: ', err);

    }
})

module.exports = router;

var express = require("express");
const User = require("../model/user.model");
const { getHash, compare } = require("../util/password.util");
const { tokenSign, tokenValidation } = require("../util/auth.util");
var router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { Op } = require("sequelize");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

//토큰 인증 api
router.get('/token-verify', (req, res) => {

  try {

    req.headers.authorization
    // console.log('req.headers.authorization: ', req.headers.authorization);

    if (!req?.headers?.authorization) throw 'Unauthorized'

    const tokenList = req.headers.authorization.split(' ')

    if (tokenList.length < 1) throw 'Unauthorized'

    const token = tokenList[1]
    const userInfo = tokenValidation(token)
    res.json(userInfo)

  } catch (error) {
    console.log('error: ', error);
    if (error === 'Unauthorized') {
      res.status(401).json({ statusMessage: 'Unauthorized' })
    } else if (error.message === 'jwt expired') {
      res.status(401).json({ statusMessage: 'Token Expired' })
    } else if (error.message === '') {
      res.status(500).json({ statusMessage: "Internal server error" })
    }
  }


})
//아이디 유효성 확인 api
router.get("/nickname-check", async (req, res) => {

  if (!req?.query?.nickname) {
    res.status(400).json({ statusMessage: "Invalid params" })
    return
  }
  const user = await User.findOne({ where: { nickname: req.query.nickname } })

  if (user) {
    // res.status(409).json({statusMessage: "Duplicated Nickname"})
    res.json({ isDuplicated: true })
    return
  }
  res.json({ isDuplicated: false })
})
//회원 가입 api
router.post("/sign-up", async (req, res) => {
  // res.send("aaaa");
  // const email = 'test@namer.com'
  // const password = '1234'
  const { id, nickname, password, email, name, birth } = req.body;

  const dupRes = await Promise.all([
    User.findOne({ where: { nickname } }),
    User.findOne({ where: { email } }),
  ]);

  if (dupRes[0]?.id) {
    res.status(409).json({ statusMessage: "Duplicated nickname" });
    return;
  }

  if (dupRes[1]?.email) {
    res.status(409).json({ statusMessage: "Duplicated email" });
    return;
  }

  const createUser = await User.create({
    id,
    nickname,
    email,
    name,
    birth,
    provider: "email",
    password: getHash(password),
    withDraw: false,
  });

  await createUser.save();

  res.json(createUser);
});

//로그인api
router.post('/login', async (req, res) => {



  const { nickname, password } = req.body

  try {
    const user = await User.findOne({ where: { nickname } });
    // console.log('nickname: ', nickname);

    if (!user) throw 'INVALID_USERNAME_OR_PASSWORD'


    const compareRes = compare(password, user.password)
    console.log('compareRes: ', compareRes);

    if (!compareRes) throw 'INVALID_USERNAME_OR_PASSWORD'

    //userinfo 에서 password 를 뺀 객체

    //rest properties
    let { password: dummyPassword, ...userInfo } = user.toJSON()
    const accessToken = tokenSign(userInfo)
    userInfo = { ...userInfo, accessToken }
    console.log(accessToken)

    if (compareRes) {
      return res.json(userInfo);
    } else {
      return res.json({ success: false, message: 'Invalid username or password' });
    }



  } catch (error) {
    console.error(error);
    if (error === 'INVALID_USERNAME_OR_PASSWORD') {
      return res.status(403).json({ success: false, message: 'Invalid username or password' });
    } else {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
})

//소셜로그인 api
router.post("/social-login", async (req, res) => {
  try {


    const client = new OAuth2Client("926618531398-36t5psht9gd5c2sk9irjdf8vlvltpd22.apps.googleusercontent.com", "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", "postmessage");
    const data = await client.getToken(req.body.code)
    const token = await client.verifyIdToken({ idToken: data.tokens.id_token })


    const gmail = token.payload.email
    const gname = token.payload.name


    //구글 소셜 로그인 이메일이 DB에 있는지 확인하기
    const foundUserProvider = await User.findOne({
      where: {
        email: gmail,
        provider: "email"
      }
    })

    const foundUserProviderGoogle = await User.findOne({
      where: {
        email: gmail,
        provider: "google"
      }
    })


    if (foundUserProvider) {
      //바로 로그인 하기, provider에 구글추가해주기
      await User.update({ provider: "email, google" }, {
        where: {
          email: gmail,
          provider: {
            [Op.like]: "email"
          }
        }
      })
    } else if (foundUserProviderGoogle) {
    } else {
      //없으면 새로 생성해주기
      await User.create({
        nickname: gname,
        password: null,
        email: gmail,
        name: gname,
        birth: null,
        provider: "google",
        withDraw: false
      })

    }

    //토큰발급
    const user = await User.findOne({ where: { email: gmail } })
    let { password: dummyPassword, ...userInfo } = user.toJSON()
    const accessToken = tokenSign(userInfo)
    userInfo = { ...userInfo, accessToken }
    res.json(userInfo)
  }
  catch (err) {
    console.log('err: ', err);
  }
})

//회원정보 수정api
router.put("/user/:userId", async (req, res) => {
  try {
    const userId = req.userInfo.id
    const { userData } = req.body

    await User.update({ name: userData.name, nickname: userData.nickname, email: userData.email, birth: userData.birth }, {
      where: {
        id: userId,
      }
    })
    const currentUser = await User.findOne({
      where: {
        id: userId
      }
    })
    res.json(currentUser)
  }
  catch (error) {
    console.log('error: ', error);
  }
})

//비밀번호 체크 api
router.post("/pw-check/", async (req, res) => {
  try {

    const { password } = req.body
    const userId = req.userInfo.id
    const user = await User.findOne({ where: { id: userId } })

    if (!user) throw 'INVALID_PASSWORD'

    const compareRes = compare(password, user.password)


    if (!compareRes) throw 'INVALID_PASSWORD'

    if (compareRes) {
      return res.json({ success: true })
    } else {
      return res.json({ success: false, message: "Invalid password" })
    }

  }
  catch (error) {
    console.log('error: ', error);
    if (error === "INVALID_PASSWORD") {
      return res.status(403).json({ statusMessage: "INVALID_PASSWORD" })
    } else {
      return res.status(500).json({ statusMessage: "Internet server error" })
    }
  }
})

//회원탈퇴 API
router.put("/user/", async (req, res) => {
  try {
    const userId = req.userInfo.id;
    await User.update({ name: null, nickname: "탈퇴회원", password: null, email: null, birth: null, withDraw: true }, {
      where: {
        id: userId
      }
    })
    res.json("탈퇴 성공")
  }
  catch (error) {
    res.status(500).json({ statusMessage: "Internal server error" })
  }
})

module.exports = router;

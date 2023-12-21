const AWS = require('aws-sdk');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoryRouter = require('./routes/category');
var postRouter = require('./routes/post')
var recipeRouter = require('./routes/recipe')
var mailRouter = require('./routes/mail')
var bookmarkRouter = require('./routes/bookmark')
var urlRouter = require('./routes/url')

const cors = require('cors');
const { sequelize } = require('./util/database.util');
const { authMiddleware } = require('./middleware/auth.middleware');
const { authGuard } = require('./guard/auth.guard');
const Ingredient = require('./model/ingredient.model');
const Recipe = require('./model/recipe.model');
const Bookmark = require('./model/bookmark.model');
const Category = require('./model/category.model');



console.log(process.env.NODE_ENV)



var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: 5000000 }));

sequelize.authenticate()
  .then((res) => {
    console.log("connect Success !!!:", res);

    Recipe.hasMany(Ingredient, {
      as: "Ingredients",
      foreignKey: 'recipeId', // This links the recipeId column in the Ingredient model to the Recipe model
      onDelete: 'CASCADE', // If a Recipe is deleted, its associated Ingredients will also be deleted
      onUpdate: 'CASCADE', // If a Recipe's ID is updated, its associated Ingredients will also be updated
    });
    Recipe.hasMany(Bookmark, {
      as: "Bookmarks",
      foreignKey: 'recipeId',
    });

    Bookmark.belongsTo(Recipe, {
      foreignKey: 'recipeId',
      as: 'bookmarks'
    })
  })
  .catch(error => {
    console.log('connect fail !!!:', error);
  })


// aws region 및 자격증명 설정
// AWS.config.update({
//   accessKeyId: process.env.S3_ACCESS_KEY_ID,
//   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//   region: 'ap-northeast-2',
// });
// // console.log('process.env.S3_ACCESS_KEY_ID: ', process.env.S3_ACCESS_KEY_ID);
// // console.log('process.env.S3_SECRET_ACCESS_KEY: ', process.env.S3_SECRET_ACCESS_KEY);

// // 자격증명 데이터를 따로 파일로 관리한다면 다음으로 호출할수 있다.
// // AWS.config.loadFromPath('./config.json');


// /* S3에 있는 버킷 리스트 출력 */
// const s3 = new AWS.S3();

// // 프로미스 기반 aws sdk api
// s3.listBuckets().promise().then((data) => {
//   // console.log('S3 : ', JSON.stringify(data, null, 2));
// });

app.use(authMiddleware)
app.use('/', indexRouter);
app.use('/post', authGuard, postRouter)
app.use('/users', usersRouter);
app.use('/category', categoryRouter);
app.use('/recipe', recipeRouter)
app.use('/mail', mailRouter)
app.use('/bookmark', bookmarkRouter)
app.use('/url', urlRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//test
//test1

module.exports = app;

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

const cors = require('cors');
const { sequelize } = require('./util/database.util');
const { authMiddleware } = require('./middleware/auth.middleware');
const { authGuard } = require('./guard/auth.guard');
const Ingredient = require('./model/ingredient.model');
const Recipe = require('./model/recipe.model');
const Bookmark = require('./model/bookmark.model');

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
      foreignKey: 'recipeId', // This links the recipeId column in the Ingredient model to the Recipe model
    });

    // Bookmark.belongsTo(Recipe, {
    //   foreignKey: 'recipeId',
    //   as: 'bookmarks'
    // })

  })
  .catch(error => {
    console.log('connect fail !!!:', error);
  })


app.use(authMiddleware)
app.use('/', indexRouter);
app.use('/post', authGuard, postRouter)
app.use('/users', usersRouter);
app.use('/category', categoryRouter);
app.use('/recipe', recipeRouter)
app.use('/mail', mailRouter)
app.use('/bookmark', bookmarkRouter)

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

module.exports = app;

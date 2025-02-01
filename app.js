require("dotenv").config();

const express = require('express')
const app = express()
const cors = require('cors');

app.use(cors())

const port = 3000
const routes = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/users',    routes.user)
app.use('/posts',    routes.post)
app.use('/comments', routes.comment)
app.use('/login',    routes.login)


//error handling middle ware. catches all next(err)
app.use((err, req, res, next) => {
  if (err) {
    res.status(500).json({ message: `An error has occured ${err.name}` });
  } else {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
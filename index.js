var mysql = require('mysql2');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
var path = require('path');
var cors = require('cors');
var multer = require('multer');
// enable CORS
app.use(cors());

// const feedRoutes = require('./routes/feed');
app.use((req, res, next) => {    
  res.setHeader('Access-Control-Allow-Origin', '*');    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');    
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');    
  next();
  });// to get access to the server from any domain like postman.
  // app.use('/feed', feedRoutes);//declaration of the routes. 
  // app.listen(8080);

//default route 
app.get('/', function(req, res) {
  return res.send({error: true, message: 'hello'})
});

//database connection
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database:"web_api_final"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
//Retrieve all books
app.get('/KH', function(req, res) {
  con.query('SELECT * FROM books WHERE type = "kh"', function(error, results, fields) {
    if(error) throw error;  
    return res.send({error: false, data: results, message:"books list"});  
  });
});
//Retrieve all books
app.get('/EN', function(req, res) {
  con.query('SELECT * FROM books WHERE type="en"', function(error, results, fields) {
    if(error) throw error;  
    return res.send({error: false, data: results, message:"books list"});  
  });
});
//Retrive book by id
app.get('/book/:id', function(req, res) {
  let book_id = req.params.id;
  if(!book_id) {  
    return res.status(400).send({error: true, message: 'Please provide book id'});
  }
  con.query(`SELECT * FROM books WHERE id = ${book_id}` , function(error, results, fields) {

    if(error) throw error;
    return res.send({error: false, data:results[0], message: 'book'});
  });
});
app.use('/uploads', express.static('uploads'));

// handle storage using multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
     cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
     cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
var upload = multer({ storage: storage });
// Add new book
app.post('/book',upload.single('dataFile'), function(req, res) {
  let file = req.file;
  let title = req.body.title;
  let author = req.body.author;
  let description = req.body.description;
  if (!file) {
    return res.status(400).send({ message: 'Please upload a file.' });
 }
  con.query(`INSERT INTO books (title, author,image, description) VALUES ('${title}','${author}','${file.filename}','${description}')`, function(error, results, fields) {
    if(error) throw error;
    return res.send({error: false, data: results, message:'New book has been created successfully.'});
  });
});

// Add user contact
app.post('/contact', function(req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let phonenumber = req.body.phonenumber;
  let subject = req.body.subject;
  con.query(`INSERT INTO contact (name, email,phonenumber, subject) VALUES ('${name}','${email}','${phonenumber}','${subject}')`, function(error, results, fields) {
    if(error) throw error;
    return res.send({error: false, data: results, message:'New book has been created successfully.'});
  });
});

//rest api to update record into mysql database
app.put('/update', function (req, res) {
  var id = req.body.id;
  var title = req.body.title;
  var author = req.body.author;
  var description = req.body.description;
  con.query('UPDATE `books` SET `title`=?,`author`=?,`description`=? where `id`=?', [title, author, description, id], function (error, results, fields) {
    console.log(req.body.title);
    if (error) throw error;
   res.end(JSON.stringify(results));
 });
});


// Delete book
app.delete('/book/delete/:id', function(req, res) {
  let book_id = req.params.id;
  if(!book_id) {
    return res.status(400).send({error: true, message:'please enter book id'});
  }
  con.query(`DELETE from books WHERE id = ${book_id}`, function(error, results, fields) {
    return res.send({error: false, message:'book has been deleted successfully'});
  });
});
// set port
app.listen(8080, function () {
console.log('Node app is running on port 8080');
});
module.exports = app;


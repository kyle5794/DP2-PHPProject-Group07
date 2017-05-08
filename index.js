var express = require('express');
var app = express();

app.use(express.static("public"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/Images", express.static(__dirname + "/Images"));
app.set('view engine', 'ejs');
app.set('views','./views');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var pg = require('pg')

var config = {
  user: 'postgres', //env var: PGUSER
  database: 'PHPInc', //env var: PGDATABASE
  password: 'database', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

//pool.on('error', function (err, client) {
//  console.error('idle client error', err.message, err.stack)
//})


app.listen(3000);

app.get('/', function (req, res) {
   res.render('index');
});

app.get('/sales/list', function(req, res){
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  //use the client for executing the query
  client.query('SELECT * FROM sales ORDER BY id ASC', function(err, result) {
    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
    done(err);

    if(err) {
      res.end();
      return console.error('error running query', err);
    }
    //console.log(result.rows[0]);
    res.render('sales_list.ejs', {list:result});
    //output: 1
    });
  });
});

app.get('/add', function (req, res) {
   res.render('add.ejs');
});

app.post('/add', urlencodedParser, function (req, res) {
  //use the client for executing the query
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    var name = req.body.name;
    var quantity = req.body.quantity;
    var date = req.body.date;
    var month = req.body.month;
    var year = req.body.year;
    var hour = req.body.hour;
    var min = req.body.min;
    var weekinYear = req.body.weekinYear;
    //use the client for executing the query
    client.query("INSERT INTO sales(name, quantity, date, month, year, hour, minute, weekyear) VALUES('"+name+"', '"+quantity+"', '"+date+"', '"+month+"', '"+year+"','"+hour+"','"+min+"','"+weekinYear+"')", function(err, result) {

      done(err);

      if(err) {
        res.end();
        return console.error('error running query', err);
      }
      res.redirect('/sales/list')

      //output: 1
      });
  });
});

app.get('/edit/:id', function(req, res){
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  var id = req.params.id;

  //use the client for executing the query
  client.query("SELECT * FROM sales WHERE id='"+id+"'", function(err, result) {
    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
    done(err);

    if(err) {
      res.end();
      return console.error('error running query', err);
    }

    //console.log(result.rows[0]);

    res.render('edit.ejs', {edit_sale:result.rows[0]});
    //output: 1
    });
  });
});

app.post('/edit', urlencodedParser,function(req,res){
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  var id = req.body.id;
  var name = req.body.name;
  var quantity = req.body.quantity;
  var date = req.body.date;
  var month = req.body.month;
  var year = req.body.year;
  var hour = req.body.hour;
  var minute = req.body.min;
  var weekyear = req.body.weekinYear;

  //use the client for executing the query
  client.query("UPDATE sales SET name='"+name+"', quantity='"+quantity+"', date='"+date+"', month='"+month+"', year='"+year+"', hour='"+hour+"',minute='"+minute+"', weekyear='"+weekyear+"' WHERE id='"+id+"'", function(err, result) {
    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
    done(err);

    if(err) {
      res.end();
      return console.error('error running query', err);
    }

    res.redirect('edit/'+id);
    //output: 1
    });
  });
})

app.get('/remove/:id', function(req, res){
  pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  var id = req.params.id;

  //use the client for executing the query
  client.query("DELETE FROM sales WHERE id='"+id+"'", function(err, result) {
    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
    done(err);

    if(err) {
      res.end();
      return console.error('error running query', err);
    }

    //console.log(result.rows[0]);

    res.redirect('../../sales/list');
    //output: 1
    });
  });
});

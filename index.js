var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
var session = require('express-session');
const db = require('better-sqlite3')('test.db');
db.pragma('journal_mode = WAL');

let sql;

app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/pages'));
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())
app.use(upload.array()); 
app.use(session({secret: "VofR1nKJKS"}));

app.use(express.static(path.join(__dirname,'pages')))
app.use(express.static(path.join(__dirname,'css')));
app.use(express.static(path.join(__dirname,'js')));
app.use(express.static(path.join(__dirname,'resources')));


function tasks_to_str(tasks_arr){
    // ["clean dishes", "fuck", "test"] => "clean dishes[]fuck[]test[]"
    var str = "";
    tasks_arr.forEach(task => {
        str+=task+"[]";
    });
    return str;
}

function tasks_to_arr(tasks_str){
    // "clean dishes[]fuck[]test[]" => ["clean dishes", "fuck", "test"] 
    var arr = tasks_str.split("[]");
    var trsh = arr.pop();
    return arr;
}

function insert_to_user_table(name, email, password, tasks){
    sql = "INSERT INTO user(name,email,password,tasks) VALUES(?,?,?,?)";
    db.prepare(sql).run(name, email, password, tasks_to_str(tasks));
}

function get_all_data_from_user_table(){
    sql = "SELECT * FROM user";
    return db.prepare(sql).all();
}

function get_data_about_user_from_user_table(email){
    sql = "SELECT * FROM user WHERE email=?";
    return db.prepare(sql).get(email);
}

function get_data_about_user_from_user_table(email){
    sql = "SELECT * FROM user WHERE email=?";
    return db.prepare(sql).get(email);
}

function update_tasks_of_user_from_user_table(email, tasks){
    sql = "UPDATE user SET tasks=? WHERE email=?";
    return db.prepare(sql).run(tasks_to_str(tasks), email);
}

function delete_user_from_user_table(email, password){
    let user_pass = get_data_about_user_from_user_table(email).password;
    if(password==user_pass){
        sql = "DELETE FROM user WHERE email=?";
        db.prepare(sql).run(email);
    }
    else{
        console.log("wrong password");
    }
}

function user_exists_in_user_table(email){
    sql = "SELECT * FROM user WHERE email=?";
    var u = db.prepare(sql).get(email);
    if(u){
        return true;
    }
    return false;
}

// insert_to_user_table("jozef", "jozo@gmail.com", "heslo123", ["clean dishes", "fuck", "test"]);
// insert_to_user_table("milan", "milo@gmail.com", "heslo123", ["povysavat", "fuck", "umyt sa"]);
// insert_to_user_table("tomas", "tomo@gmail.com", "heslo123", ["napisat natalke", "ist srat", "ist spat"]);

app.use('/', function(req, res, next){
    console.log("A new request received at " + Date.now());
    next();
 });

app.get('/', function(req, res){
    if(req.session.login){
        var u = get_data_about_user_from_user_table(req.session.login);
        res.render('home.html', {root: __dirname+'/pages', name:u.name, tasks:tasks_to_arr(u.tasks)});
    }
    else{
        res.redirect("/login");
    }
});

app.get('/login', function(req, res){
    res.render('login.html', {root: __dirname+'/pages'});
});

app.post('/auth/login', function(req, res){
    const {email, password} = req.body;
    if(user_exists_in_user_table(email)){
        var u = get_data_about_user_from_user_table(email);
        if(password==u.password){
            req.session.login = email;
            res.redirect("/");
        }
        else{
            res.redirect("/login");
        }
    }
    else{
        res.redirect("/register");
    }
});

app.get('/register', function(req, res){
    res.render('register.html', {root: __dirname+'/pages'});
});

app.post('/auth/register', function(req, res){
    const {name, email, password} = req.body;
    if(user_exists_in_user_table(email)){
        res.redirect("/login");
    }
    else{
        console.log(name, email, password);
        insert_to_user_table(name, email, password, ["start using this"]);
        res.end("SUCCESS");
    }
});

app.get('/delete', function(req, res){
    if(req.session.login){
        res.render('delete.html', {root: __dirname+'/pages'});
    }
    else{
        res.redirect("/login");
    }
});

app.post('/auth/delete', function(req, res){
    const {email, password} = req.body;
    if(user_exists_in_user_table(email)){
        var u = get_data_about_user_from_user_table(email);
        if(password==u.password && email==req.session.login){
            delete_user_from_user_table(email, password);
            req.session.login = null;
            res.redirect("/login");
        }
        else{
            res.redirect("/");
        }
    }
    else{
        res.redirect("/login");
    }
});

app.get('*', function(req, res){
    res.render('404.html', {root: __dirname+'/pages'});
});


const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});

// app.listen(8080, ()=>{
//     console.log('Server started');
//     // console.log(get_all_data_from_user_table());
// });

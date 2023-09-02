var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
var session = require('express-session');
var emailValidator = require('deep-email-validator');
const db = require('better-sqlite3')('./test.db');
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

function tasks_to_str(tasks_json){
    return JSON.stringify(tasks_json);
}

function tasks_to_json(tasks_str){
    return JSON.parse(tasks_str);
}

// function tasks_to_str(tasks_arr){
//     // ["clean dishes", "fuck", "test"] => "clean dishes[]fuck[]test[]"
//     var str = "";
//     tasks_arr.forEach(task => {
//         str+=task+"[]";
//     });
//     return str;
// }

// function tasks_to_arr(tasks_str){
//     // "clean dishes[]fuck[]test[]" => ["clean dishes", "fuck", "test"] 
//     var arr = tasks_str.split("[]");
//     var trsh = arr.pop();
//     return arr;
// }

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
        res.render('home.html', {root: __dirname+'/pages', name:u.name, tasks:tasks_to_json(u.tasks)});
    }
    else{
        req.session.success = {is:false, mess:"You Are Not Logged in"};
        res.redirect("/login");
    }
});

app.get('/login', function(req, res){
    let success = null;
    if(req.session.success!=null){
        success = req.session.success;
        req.session.success = null;
    }
    res.render('login.html', {root: __dirname+'/pages', success:success});
});

app.post('/auth/login', function(req, res){
    const {email, password} = req.body;
    if(user_exists_in_user_table(email)){
        var u = get_data_about_user_from_user_table(email);
        if(password==u.password){
            req.session.login = email;
            req.session.success = {is:true, mess:"Login Successful"};
            res.redirect("/");
        }
        else{
            req.session.success = {is:false, mess:"Wrong Password"};
            res.redirect("/login");
        }
    }
    else{
        req.session.success = {is:false, mess:"User Dont Exist"};
        res.redirect("/register");
    }
});

app.get('/register', function(req, res){
    let success = null;
    if(req.session.success!=null){
        success = req.session.success;
        req.session.success = null;
    }
    res.render('register.html', {root: __dirname+'/pages', success:success});
});

app.post('/auth/register', async function(req, res){
    const {name, email, password} = req.body;
    if(name.trim().length != 0 && email.trim().length != 0 && password.trim().length != 0){
        let email_ = email.trim();
        if(user_exists_in_user_table(email_)){
            req.session.success = {is:false, mess:"User Allready Exist"};
            res.redirect("/login");
        }
        else{
            const {valid, reason, validators} = await emailValidator.validate(email_);
            if(valid){
                insert_to_user_table(name, email_, password, {"Zacat toto pouzivat":{"in_progress":false, "important":true}});
                req.session.success = {is:true, mess:"Registration Successfull"};
                res.redirect("/login");
            }
            else{
                req.session.success = {is:false, mess:"Registration Failed"};
                res.redirect("/register");
            }
        }
    }
    else{
        req.session.success = {is:false, mess:"Registration Failed"};
        res.redirect("/register");
    }
});

app.get('/delete', function(req, res){
    if(req.session.login){
        res.render('delete.html', {root: __dirname+'/pages'});
    }
    else{
        req.session.success = {is:false, mess:"You Are Not Logged in"};
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
            req.session.success = {is:true, mess:"User Deleted Successfully"};
            res.redirect("/login");
        }
        else{
            req.session.success = {is:false, mess:"User Was Not Deleted"};
            res.redirect("/");
        }
    }
    else{
        req.session.success = {is:false, mess:"This User Dont Exist"};
        res.redirect("/login");
    }
});

app.post('/auth/logout', function(req, res){
    if(req.session.login){
        req.session.login = null;
    }
    req.session.success = {is:true, mess:"Logout Successful"};
    res.redirect("/login");
});


app.post('/task/delete/', function(req, res){
    if(req.session.login){
        var u = get_data_about_user_from_user_table(req.session.login);
        var tasks = tasks_to_json(u.tasks);
        if (req.body.task in tasks) {
            delete tasks[req.body.task];
        }
        update_tasks_of_user_from_user_table(req.session.login, tasks);
        res.end("deleted");
    }
    else{
        req.session.success = {is:false, mess:"You Are Not Logged in"};
        res.redirect("/login");
    }
});

app.post('/task/progress/', function(req, res){
    if(req.session.login){
        var u = get_data_about_user_from_user_table(req.session.login);
        var tasks = tasks_to_json(u.tasks);
        if (req.body.task in tasks) {
            tasks[req.body.task]["in_progress"] = !tasks[req.params.task]["in_progress"];
        }
        update_tasks_of_user_from_user_table(req.session.login, tasks);
        res.redirect("/");
    }
    else{
        req.session.success = {is:false, mess:"You Are Not Logged in"};
        res.redirect("/login");
    }
});

app.post('/task/important/', function(req, res){
    if(req.session.login){
        var u = get_data_about_user_from_user_table(req.session.login);
        var tasks = tasks_to_json(u.tasks);
        if (req.body.task in tasks) {
            tasks[req.body.task]["important"] = !tasks[req.params.task]["important"];
        }
        update_tasks_of_user_from_user_table(req.session.login, tasks);
        res.redirect("/");
    }
    else{
        req.session.success = {is:false, mess:"You Are Not Logged in"};
        res.redirect("/login");
    }
});

app.post('/task/add', function(req, res){
    if(req.session.login){
        var u = get_data_about_user_from_user_table(req.session.login);
        var tasks = tasks_to_json(u.tasks);
        if(req.body.new_task.trim().length != 0){
            var res_task = req.body.new_task.trim();
            tasks[res_task] = {"in_progress":false, "important":false};
            update_tasks_of_user_from_user_table(req.session.login, tasks);
        }
        res.redirect("/");
    }
    else{
        req.session.success = {is:false, mess:"You Are Not Logged in"};
        res.redirect("/login");
    }
});

app.post("/task/get", function(req, res){
    if(req.session.login){
        var u = get_data_about_user_from_user_table(req.session.login);
        res.json(tasks_to_json(u.tasks));
    }
    else{
        req.session.success = {is:false, mess:"You Are Not Logged in"};
        res.redirect("/login");
    }
});

app.get('*', function(req, res){
    res.render('404.html', {root: __dirname+'/pages'});
});


const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
    console.log(get_all_data_from_user_table());
    // update_tasks_of_user_from_user_table("marek@gmail.com", {"spravit pekny styl":{"in_progress":false, "important":true}});
});
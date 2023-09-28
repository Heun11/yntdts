function getTasks(){
    $.ajax({
        type: "POST",
        url: "/task/get",
        data: {},
        success: function(data) {
            let html;
            let classes;
            let task;
            let date;

            $("#task-list").empty();
            let keys = Object.keys(data);
            keys = keys.reverse();
            keys.forEach((key)=>{
                classes = "task-box";
                if((data[key].important==="true")==true){
                    classes+=" task-important";
                }
                if(data[key].in_progress==true){
                    classes+=" task-in_progress";
                }
                date = data[key].date;
                date = "No date specified!";
                if(date==""){
                    date = "No date specified!";
                }

                task = key.split(" ").join("-");

                html = `<div class="${classes}" id="${task}">
                    <div class="task-box-task"> 
                        <p>${key}</p>
                        <p class="task-box-datum">${date}</p>
                    </div>
                    <div>
                        <button onclick="deleteTask(this)">delete</button>
                        <button onclick="progressTask(this)">progress</button>
                    </div>
                </div>`;
                $("#task-list").append(html);
            });
        }, 
        error: function(data) {
        // Server error, e.g. 404, 500, error
            alert(data.responseText);
        }
    });
}


function addTask(){
    let task_ = $("#new_task").val();
    $("#new_task").val("");
    let task__ = task_.trim();
    let task = task__.split(" ").join("-");
    let imcheck = document.getElementById("important_check").checked;
    let date = document.getElementById("date").value;
    document.getElementById("important_check").checked = false;
    $.ajax({
        type: "POST",
        url: "/task/add",
        data: {
        "new_task": task__,
        "important": imcheck,
        "date":date
        },
        success: function(data) {
            getTasks();
        },
        error: function(data) {
        // Server error, e.g. 404, 500, error
            alert(data.responseText);
        }
    });
}

function deleteTask(this_){
    let parent = $(this_).parent().parent();
    let task_ = (parent[0].children[0].children[0].innerHTML);
    $.ajax({
        type: "POST",
        url: `/task/delete`,
        data: {
            "task":task_
        },
        success: function(data) {
            getTasks();
        },
        error: function(data) {
        // Server error, e.g. 404, 500, error
            alert(data.responseText);
        }
    });
}

function progressTask(this_){
    let parent = $(this_).parent().parent();
    let task_ = (parent[0].children[0].children[0].innerHTML);
    $.ajax({
        type: "POST",
        url: `/task/progress`,
        data: {
            "task":task_
        },
        success: function(data) {
            getTasks();
        },
        error: function(data) {
        // Server error, e.g. 404, 500, error
            alert(data.responseText);
        }
    });
}
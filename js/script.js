function getTasks(){
    $.ajax({
        type: "POST",
        url: "/task/get",
        data: {},
        success: function(data) {
        // POST was successful - do something with the response
        //   alert("refresh");
            let html;
            let classes;
            let task;

            $("#task-list").empty();
            let keys = Object.keys(data);
            keys.forEach((key)=>{
                classes = "task-box";
                if((data[key].important==="true")==true){
                    classes+=" task-important";
                }
                if(data[key].in_progress==true){
                    classes+=" task-in_progress";
                }

                task = key.split(" ").join("-");

                html = `<li class="${classes}" id="${task}">
                    <p>${key}</p>
                    <br>
                    <button onclick="deleteTask(this)">delete</button>
                    <button onclick="progressTask(this)">progress</button>
                </li>`;
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
    let task__ = task_.trim();
    let task = task__.split(" ").join("-");
    let imcheck = document.getElementById("important_check").checked;
    $.ajax({
        type: "POST",
        url: "/task/add",
        data: {
        "new_task": task__,
        "important": imcheck
        },
        success: function(data) {
        // POST was successful - do something with the response
        //   alert("refresh");

            // if($(`#${task}`).length){
                
            // }
            // else{
            //     let html = `<li class="task-box" id="${task}">
            //         <p>${task__}</p>
            //         <br>
            //         <button onclick="deleteTask(this)">delete</button>
            //     </li>`;
            //     $("#task-list").append(html);
            // }
            getTasks();
        },
        error: function(data) {
        // Server error, e.g. 404, 500, error
            alert(data.responseText);
        }
    });
}

function deleteTask(this_){
    let parent = $(this_).parent();
    let task_ = (parent[0].children[0].innerHTML);
    $.ajax({
        type: "POST",
        url: `/task/delete`,
        data: {
            "task":task_
        },
        success: function(data) {
        // POST was successful - do something with the response
            // $(`#${task}`).remove();
            // alert(data);
            getTasks();
        },
        error: function(data) {
        // Server error, e.g. 404, 500, error
            alert(data.responseText);
        }
    });
}

function progressTask(this_){
    let parent = $(this_).parent();
    let task_ = (parent[0].children[0].innerHTML);
    $.ajax({
        type: "POST",
        url: `/task/progress`,
        data: {
            "task":task_
        },
        success: function(data) {
        // POST was successful - do something with the response
            // $(`#${task}`).remove();
            // alert(data);
            getTasks();
        },
        error: function(data) {
        // Server error, e.g. 404, 500, error
            alert(data.responseText);
        }
    });
}
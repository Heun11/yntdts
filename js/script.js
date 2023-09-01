function getTasks(){
    $.ajax({
        type: "POST",
        url: "/task/get",
        data: {},
        success: function(data) {
        // POST was successful - do something with the response
        //   alert("refresh");
            let html;
            let task;

            $("#task-list").empty();
            let keys = Object.keys(data);
            keys.forEach((key)=>{
                task = key.split(" ").join("-");
                html = `<li class="task-box" id="${task}">
                    <p>${key}</p>
                    <br>
                    <button onclick="deleteTask(this)">delete</button>
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
    // alert(task);
    $.ajax({
        type: "POST",
        url: "/task/add",
        data: {
        "new_task": task__ // various ways to store the ID, you can choose
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
    let task = $(this_).parent().attr("id");
    let task_ = task.split("-").join(" ");
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
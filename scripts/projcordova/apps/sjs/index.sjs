function ofjs_p1_click(eventer){
    alert("p1 click");
}
function ofjs_pdrop_drop(eventer){
}
function jq_drop_global(eventer){
    console.log(eventer);
 console.log("drop");
}
function jq_keyevent_global(eventer){
    console.log(eventer);
}

function jq_deviceready(eventer){
    logMe("device ready");
}
function comp_home_init(eventer){
    //setInterval(function() {logMe("init1 time");}, 1000);
    //logMe("init1");
}
function comp_home_destroy(eventer){
    logMe("destroy1");
}
function comp_home_show(eventer){
    logMe("show1");
}
function comp_home_hide(eventer){
    logMe("hide1");
}
function ofjs_btnpage2_click_comp_pg1_init(eventer){
    onsen.loadPage("page2.html");
        console.log("click");
}

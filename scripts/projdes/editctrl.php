<?php
// This file is part of the Sphp Framework.
// (c) 2023 Sphp Framework Team <https://sartajphp.com>
registerApp("vseditor",__DIR__ ."/apps/vseditor.app");

function disable_secuirty_headers() {
//SphpBase::sphp_api()->addProp('page_title','set page_title prop in app');
//$policy = SphpBase::sphp_response()->getSecurityPolicy("*.*");
// SphpBase::sphp_response()->addSecurityHeaders(array());
//\SphpBase::sphp_response()->addHttpHeader('Access-Control-Allow-Origin', '*');
//\SphpBase::sphp_response->()addHttpHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, PATCH, OPTIONS');
//SphpBase::sphp_response()->addHttpHeader('Content-Security-Policy','media-src *.*;');

SphpBase::sphp_response()->removeHttpHeader('Strict-Transport-Security');
SphpBase::sphp_response()->removeHttpHeader('Content-Security-Policy');
SphpBase::sphp_response()->removeHttpHeader('Content-Security-Policy-Report-Only');
SphpBase::sphp_response()->removeHttpHeader('Cross-Origin-Opener-Policy');
SphpBase::sphp_response()->removeHttpHeader('X-Frame-Options');
SphpBase::sphp_response()->removeHttpHeader('X-Content-Type-Option');
SphpBase::sphp_response()->removeHttpHeader('X-Xss-Protection');
SphpBase::sphp_response()->addHttpHeader('Access-Control-Allow-Origin', '*');
//SphpBase::sphp_response()->addHttpHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
//SphpBase::sphp_response()->addHttpHeader('Access-Control-Allow-Headers', 'Content-Type');
//SphpBase::sphp_response()->addHttpHeader('X-Frame-Options', '*.*');
//SphpBase::sphp_response()->addHttpHeader('Content-Security-Policy', "frame-ancestors http://127.0.0.1:8000 http://localhost:8000 http://localhost http://127.0.0.1 http://*");

}

function enableEditing() {
    addHeaderCSS("vseditor.css",".highlight {
            border-color: #0078d7;
            background-color: rgba(0, 120, 215, 0.1);
        }");
        addHeaderJSFunctionCode("ready", "enbledt1", ' 
 var parentOrigin = null;
 let draggedItem = null;' .
" const \$dropZones = $('.col');
 \$dropZones.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation()
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        $(this).addClass('highlight');
    });
    
    \$dropZones.on('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation()
        $(this).addClass('highlight');
    });
    
    \$dropZones.on('dragleave', function() {
        $(this).removeClass('highlight');
    });
    
    \$dropZones.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation()
         $(this).removeClass('highlight');
const dataTransfer = e.originalEvent.dataTransfer;
        let droppedItems = [];
        $(this).append(draggedItem.bc);
    });



".        
'        window.addEventListener(\'message\', (event) => {
            if (event.data.evt === \'init\') {
                parentOrigin = event.origin;
                sendToVS(\'init\');
            } else if(event.data.evt === \'dragdrop\') {
                draggedItem = event.data.bdata;
            }else{
            /* implement more features in future
        */
                console.log(event.data.bdata);
            }
        });
        
        function sendToVS(evt,evtp="",bdata={}) {
            if (parentOrigin === null) {
                console.error(\'Parent origin not initialized yet\');
                return;
            }
            var message = {
                command: "sendToVS",
                ctrl: "",
                evt: evt,
                evtp: evtp,
                bdata: bdata
            };
                        
            try {
                window.parent.postMessage(message, parentOrigin);
            } catch (error) {
                console.error(\'Failed to send message:\' + error);
            }
        }
        $("[data-sedtt]").on("click", function(event) {
        $("[data-sedtt]").css("border","");
        var obj = $(event.target);
        if($(event.target).data("sedt") === undefined){
        if($(obj).data("sedtt") === undefined){
            obj = $(event.target).closest("[data-sedtt]");
        }
            if($(obj).data("sedt") === undefined){        
                const mypos = $(obj).data("sedtt");
                var stemp1 = $(obj).closest(".stemp");
                var data = $(stemp1).data("stemp");
                sendToVS("tagclick",mypos,data);
            }else{
                compclick(obj);
            }
        }else{
            compclick(obj);
        }
        $(obj).css("border","2px solid red");
        });
        function compclick(obj) {
        const tmpname = "funstemp" + $(obj).data("sedt");
        const myid = $(obj).attr("id");
        const tempret = lsttempfun[tmpname]();
        sendToVS("fillcomplist",myid,tempret);
        const sedt = tempret[myid].attr;
        const sedtp = tempret[myid].info;
        tempret[myid].info["id"] = tempret[myid].attr["id"];
        sendToVS("compclick",myid,tempret[myid]);
        }
        $("[data-sedt]").on("blur", function(event) {
            $(event.target).css("border","");
        });
        $("[data-sedtt]").on("blur", function(event) {
            $(event.target).css("border","");
        });
        document.ondblclick = function(event) { 
    if($(event.target).closest(".stemp").length > 0){
        var stemp1 = $(event.target).closest(".stemp");
        var data = $(stemp1).data("stemp");
        sendToVS("openFile",data["tempfname"],data);
               
    }else if($(this).contents().find("meta[name=\'generator\']").length > 0){
        var masterf = $(this).contents().find("meta[name=\'generator\']");
    //console.log(masterf);
        var data = {};
        data["tempfname"] = $(masterf).data("masterf");
        data["tempappname"] = $(masterf).data("mappname");
        sendToVS("openFile",$(masterf).data("masterf"),data);
    }
    window["ProcessSphpCM"] = function(message) {
        if(message == "reload"){
            window.location.reload(true);
        }
	console.log(message);
    };
};',true);
    }

disable_secuirty_headers();
enableEditing();

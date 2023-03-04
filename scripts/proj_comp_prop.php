<?php
define("sphp_mannually_start_engine",true);
global $p1,$tblName;
$p1 = $argv[1];
$compcode = $argv[2];
$tagid = $argv[3];
chdir($p1); 
require_once($p1 . "/start.php");

class compPropViewer{
    

    public function send(){
        global$p1,$tagid,$compcode;
        $tmp1 = new TempFile($compcode,true);
        $comp1 = $tmp1->getComponentSafe($tagid);
        if($comp1 !== null){
            $arr = array();
            $arr['comp#' . $comp1->cfilename] = [array('comp' => ''),array($comp1->mypath => '', $comp1->name => '')];
            $files = $comp1->helpPropList();
            if(count($files)>0){
                foreach ($files as $key => $file) {
                    $arr[$key] = [array($key => ''),array($file[0] => '', $file[4] => '')];
                }
            }
            echo json_encode($arr);
        }else{
            echo '{}';
        }
    }


        
}

$v1 = new compPropViewer();
$v1->send();

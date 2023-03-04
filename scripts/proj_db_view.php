<?php
define("sphp_mannually_start_engine",true);
$p1 = $argv[1];
chdir($p1); 
require_once($p1 . "/start.php");

class dbviewer {
    public $myDbEngine = null;
    
    public function onstart(){
        //include_once(\SphpBase::sphp_settings()->lib_path . "/lib/MySQL.php");
        //$this->myDbEngine = new \MySQL(\SphpBase::engine());
        $this->myDbEngine = \SphpBase::dbEngine();
    }

    public function send(){
        $this->myDbEngine->connect();
        $arrT = $this->genList(); 
        $this->myDbEngine->disconnect();
        echo json_encode($arrT);
    }

    public function genList(){
        global $fileidcount;
        $arr = array();
        $arr1 = array();
        $arr3 = array();
        $arr2 = array();
        
        $folders = $this->myDbEngine->getDbTables(); 
        if(count($folders)>0 && is_array($folders)){
            foreach ($folders as $key => $folder) {
                $arr2 = $this->genFieldList($folder);
                if(count($arr2)>0){
                    $arr[$folder] = [array($folder=>''),$arr2];
                }else{
                    $arr[$folder] = array($folder=>'');
                }
            }
        }
        
        
        return $arr; 
        //$str = "";
        }
        public function genFieldList($tableName) {
            global $fileidcount;
            $arr = array();
            $files = $this->myDbEngine->getTableColumns($tableName);
        if(count($files)>0){
            foreach ($files as $key => $file) {
                $arr[$file['Field']] = $file;
                //$arr3["text"] = $file['Field'] . ' ' . $file['Type'] . ' ' . $file['Key'] . ' ' . $file['Extra'] . ' ' . $file['Default'];
            }
        }
        return $arr; 
        
        }
        
}

$v1 = new dbviewer();
$v1->onstart();
$v1->send();

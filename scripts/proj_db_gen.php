<?php
define("sphp_mannually_start_engine",true);
global $p1,$tblName;
$p1 = $argv[1];
$tblName = $argv[2];
chdir($p1); 
require_once($p1 . "/start.php");

class dbviewer {
    public $myDbEngine = null;
    
    public function onstart(){
        $this->myDbEngine = \SphpBase::dbEngine();
    }

    public function send(){
        $this->myDbEngine->connect();
        $this->dbformgensub(); 
        $this->myDbEngine->disconnect();
        echo  "done";
    }

    public function dbformgensub() {
        global $p1,$tblName;
        include_once(SphpBase::sphp_settings()->lib_path . "/dev/DBGen2.php");
        $dbf = new Sphp\dev\DBGen2($this->myDbEngine);
        $aname = $tblName;
        $actrl = $tblName;
        $atype = 'type';
        $filebase = $p1 . "/apps/";
        $editfile = "{$filebase}forms/{$actrl}-edit.front";
        $listfile = "{$filebase}forms/{$actrl}-list.front";
        $appfile = "{$filebase}{$actrl}.app";
        $all = 0;
        if($atype == "Edit Form"){
            $all = 1;
        }else if($atype == "Both Form"){
            $all = 2;
        }else{
            $all = 3;
        }
        
        if(!file_exists($editfile) && $all > 0){
            file_put_contents($editfile, $dbf->getEditForm("$aname",$actrl));
        }
        if(!file_exists($listfile) && $all > 1){
            file_put_contents($listfile, $dbf->getShowForm("$aname",$actrl));
        }
        if(!file_exists($appfile) && $all > 2){
            file_put_contents($appfile, $dbf->getApp("$aname",$actrl));
        }
        
        //$v = htmlentities($dbf->getEditForm($aname,$actrl));
        //$v = htmlentities($dbf->getShowForm($aname,$actrl));
        //$v = htmlentities($dbf->getApp($aname,$actrl));
        //$this->JSServer->addHTMLBlock("txagenformout",$v);
        //showinDialog($tempf2);
        //$this->debug->printAll();
    }

        
}

$v1 = new dbviewer();
$v1->onstart();
$v1->send();

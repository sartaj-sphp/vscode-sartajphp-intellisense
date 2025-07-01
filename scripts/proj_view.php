<?php
define("sphp_mannually_start_engine",true);
$strp = $argv[1];
$p1 = $argv[2];
$p2 = pathinfo($strp);
$extn = $p2['extension'];
chdir($p1); 
global $passFrontFile;

if($extn == "front" || $extn == "temp"){
    $_SERVER['REQUEST_URI'] = "/vsproj_view.html";
    require_once($p1 . "/start.php");
    registerApp("vsproj_view",__DIR__ . "/vsdesignrun.app");
    $passFrontFile = $strp; 
    SphpBase::sphp_api()->runApp(__DIR__ . "/vsdesignrun.app");

}else if($extn == "app"){
    SphpBase::sphp_api()->runApp($strp);
}else{
include_once($strp);
}
?>
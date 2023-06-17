<?php
/**
 * @author Sartaj Singh <sartajphp.com>
 */
include_once(__DIR__ . "/DIR.php");
//include_once(__DIR__ . "/vendor/sartajphp/sartajphp/res/Score/Sphp/extd/ConsoleApp.php");
$dir = new DIR();
$src = realpath(__DIR__ . "/projcordova");
$parentfolderpath = $argv[1];
$parentfolder = $argv[2];
$folder = str_replace(' ','',$parentfolder);

$ar1 = array();
//$shell1 = new ConsoleApp();
//$shell1->createQue($ar1,)
$cmd1 = 'cd '. $parentfolderpath .' && cordova create ' . $parentfolder . ' com.sartajphp.'. $folder .' HelloWorld && cd '. $parentfolderpath . '/'.$parentfolder . ' && cordova platform add android';
exec($cmd1,$ar1,$result);
print_r($ar1);
$dir->directoryCopy($src,$parentfolderpath . '/'.$parentfolder);
echo "Project Created \n";
echo "Run:- composer install in project folder \n";
echo "Or install SphpDesk + Sphp Server Support with NPM:- npm install -g sphpdesk \n";
echo "For SphpDesk you need to edit start.php file and may be add app.sphp file \n";

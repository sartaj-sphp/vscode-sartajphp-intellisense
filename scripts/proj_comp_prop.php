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
            /*
            $files = $comp1->helpPropList();
            if(count($files)>0){
                foreach ($files as $key => $file) {
                    $arr[$key] = [array($key => ''),array($file[0] => '', $file[4] => '')];
                }
            }
            */
            $class_info = new \ReflectionClass($comp1);
            $mainClass = get_class($class_info);
            $sphp_api = \SphpBase::sphp_api();
            $ar = array();
            //$ar = $sphp_api->rtClassMethod($class_info);
            //$sphp_api()->rtClassMethodHelp($mainClass,$class_info,$ar);
            $methods = $class_info->getMethods(\ReflectionMethod::IS_PUBLIC | \ReflectionMethod::IS_ABSTRACT | \ReflectionMethod::IS_FINAL);
            //$methods = $reflector->getMethods(\ReflectionMethod::IS_PUBLIC);
            $banmethods = array('__construct', '__destruct', '__call', '__callStatic', 
            '__get', '__set', '__isset', '__unset', '__sleep', '__wakeup', '__toString',
             '__invoke', '__set_state', '__clone', '__debugInfo','onrender','onprerender',
             'render','prerender','loadScript','parseHTML',
            'onjsrender','onprejsrender','oncreate','oncompcreate','oninit','oncompinit',
            'executePHPCode','getDynamicContent','addDynamicFileLink','onaftercreate',
            'onappevent','renderLast','onchildevent','onholder','onparse','setClassPath',
            'init','helpPropList','setVersion','getVersion','setMinVersionSphp','getMinVersionSphp',
        'setMaxVersionSphp','getMaxVersionSphp','setMinVersionPHP','getMinVersionPHP',
        'setMaxVersionPHP','getMaxVersionPHP');
        $banmethodsa = array();
        foreach ($banmethods as $key => $v1) {
            $banmethodsa[$v1] = '';
        }
            foreach ($methods as $key2 => $method) {
                if(isset($banmethodsa[$method->getName()])){
                    continue;
                }   
                $strParam = $sphp_api->rtMethodParm($method);
                $ar[$method->getName()] = array('(' . $strParam[1] . ')', "Method " . $mainClass, "", $method->getName() . '($0' . $strParam[0] . ')', "Method");
                //break;
            }

            foreach ($ar as $key => $val2) {
                $name = $key ;
                $arr[$name] = [array($name => ''),array($val2[4] => '', $val2[0] => '')];
            } 

            echo json_encode($arr);
        }else{
            echo '{}';
        }
    }


        
}

$v1 = new compPropViewer();
$v1->send();

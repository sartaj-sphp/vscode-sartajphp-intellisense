<?php

class index extends \Sphp\tools\MobileApp{
    
    public function page_new() {
        $this->mobappname = "HelloCordova";
        $folder = str_replace(' ','',basename(PROJ_PATH));
        $this->mobappid = "com.sartajphp.{$folder}";
        // use autoversion
        //$this->mobappversion = "1.0.0";
        $this->mobappdes = "A sample Apache Cordova application that responds to the deviceready event.";
        $this->mobappauthor = "Apache Cordova Team";
        $this->mobappauthoremail = "dev@cordova.apache.org";
        $this->mobappauthorweb = "https://cordova.apache.org";
    
        SphpJsM::addBootStrap();
        $this->addDistLib($this->phppath . "/jslib/twitter/bootstrap4");
        $this->addDistLib($this->phppath . "/jslib/onsen");
        $this->addPage(new TempFile($this->apppath . "/forms/page2.front"));
        $this->addPage(new TempFile($this->apppath . "/forms/page3.front"));
    } 
}

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

        // servers which access via ajax
        $hostlist = "http://192.168.10.7 ";
        $meta = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' 
        data: gap:  '. $hostlist .' https://ssl.gstatic.com ; 
        script-src \'self\'  '. $hostlist .' \'unsafe-inline\' 
        \'unsafe-eval\';style-src \'self\'  '. $hostlist .' \'unsafe-inline\';
         media-src *; img-src * data: content:; frame-src  '. $hostlist .' ; 
         connect-src \'self\' '. $hostlist .' ;">
        <meta name="format-detection" content="telephone=no">
        <meta name="msapplication-tap-highlight" content="no">
    ';
        $this->setSpecialMetaTag($meta);
    } 
}

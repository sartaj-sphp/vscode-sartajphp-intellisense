<?php

use Sphp\tools\BasicApp;

class Vsdesignrun extends BasicApp {
    private $home_file;
    public function onstart(){
        global $masterf,$passFrontFile;
        $this->setMasterFile($masterf);
        $this->home_file = new TempFile($passFrontFile);

    }

    public function page_new()
    {
        $this->setTempFile($this->home_file);
    }

}
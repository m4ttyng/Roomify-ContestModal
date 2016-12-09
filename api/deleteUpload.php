<?php

if (unlink(dirname(__FILE__) . "/upload/" . $_POST['file'])){
    
    echo('{"code":0,"message":"Upload Deleted"}');
}else{

    echo('{"code":1,"message":"Upload Deletion Failure"}');
}
?>
<?php 
//contestUpload.php
require_once ("dbconnection.php");
header("Content-Type: application/json");
define('MB', 1048576);



//print_r($_FILES['SelectedFile']);


// Check for errors
if($_FILES['SelectedFile']['error'] > 0){
     exit( '{"code":1, "message":"An error occured while uploading."}');
}

if(!getimagesize($_FILES['SelectedFile']['tmp_name'])){
     exit( '{"code":1, "message":"File Upload Failed: Please ensure you are uploading an image."}');
}


$allowed =  array('jpeg','png' ,'jpg');
$filename = strtolower($_FILES['SelectedFile']['name']);
$ext = pathinfo($filename, PATHINFO_EXTENSION);
if(!in_array($ext,$allowed) ) {
    exit( '{"code":1, "message":"File Upload Failed: File type not supported."}');
}

// Check filesize
if($_FILES['SelectedFile']['size'] > 8*MB){
  exit( '{"code":1, "message":"File Upload Failed: File size too big."}');
}


// Check if the file exists
$actual_name = pathinfo($filename,PATHINFO_FILENAME);
$original_name = $actual_name;
$i = 1;

while(file_exists('../upload/'.$actual_name.".".$ext))
{           
    $actual_name = (string)$original_name.'-'.$i;
    $filename = $actual_name.".".$ext;
    $i++;
}

// Upload file
if(!move_uploaded_file($_FILES['SelectedFile']['tmp_name'], '../upload/' . $filename)){
    exit( '{"code":1, "message":"File Upload Failed: Check Destination is writable."}');
}


$projID = 1;
$name = $_FILES['SelectedFile']['name'];
$type = $_FILES['SelectedFile']['type'];
$size = $_FILES['SelectedFile']['size'];


$sqlQuery = "INSERT INTO `project_files`(`room_id`, `filename`, `filetype`, `filesize`) VALUES ('$projID','$name','$type','$size')";

$conn->query($sqlQuery);



// Success!
exit ('{"code":0, "message":"File Upload Success", "fileName":"'.$filename.'"}');

?>
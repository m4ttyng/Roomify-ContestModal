<?php
//contestUpload.php
require_once ("dbconnection.php");
require_once ("debug.php");

header("Content-Type: application/json");
ini_set('display_errors',1);
error_reporting(E_ALL);



$proj_title = $_POST['title'];
$proj_desc =  $_POST['desc'];
$proj_length =  $_POST['length'];
$proj_prize =  $_POST['prize'];
$proj_creator = 8;

$room_type = $_POST['roomType'];
$room_width = $_POST['roomWidth'];
$room_length = $_POST['roomLength'];
$room_height = $_POST['roomHeight'];
$room_features = json_decode($_POST['roomFeatures'], true);
$room_files = json_decode($_POST['roomFiles'], true);


$endTime = strtotime('+'.$proj_length.' weeks');
$endDate = date("Y-m-d H:i:s",$endTime);


$sqlQuery = 'INSERT INTO `projects`(`project_title`, `project_desc`, `closing_date`, `creator_id`, `state`, `prize`) VALUES ("'.$proj_title.'","'.$proj_desc.'","'.$endDate.'",'.$proj_creator.',"qualifying",'.$proj_prize.')';


$stmt = $conn->prepare($sqlQuery);
$stmt->execute();

$sqlQuery2 = 'SELECT max(project_id) FROM `projects` WHERE creator_id = '.$proj_creator;
    
$stmt2 = $conn->prepare($sqlQuery2);
$stmt2->execute();
$result = $stmt2->fetch(PDO::FETCH_NUM);
$proj_id = $result[0];
    
    
$sqlQuery3 = 'INSERT INTO `project_rooms`(`room_type`,`project_id`,`room_length`,`room_width`,`room_height`) VALUES ("'.$room_type.'",'.$proj_id.','.$room_length.','.$room_width.','.$room_height.')';

$stmt3 = $conn->prepare($sqlQuery3);
$stmt3->execute();

$sqlQuery4 = 'SELECT max(room_id) FROM `project_rooms` WHERE project_id = '.$proj_id;

$stmt4= $conn->prepare($sqlQuery4);
$stmt4->execute();
$result2 = $stmt4->fetch(PDO::FETCH_NUM);
$room_id = $result2[0];


foreach ($room_features as $feature){

    $sqlQuery5 = 'INSERT INTO `project_properties`(`room_id`,`feature_name`) VALUES ('.$room_id.',"'.$feature.'")';

    $stmt5 = $conn->prepare($sqlQuery5);
    $stmt5->execute();
}

foreach ($room_files as $file){

    $sqlQuery6 = 'INSERT INTO `project_files`(`room_id`,`filename`,`filetype`,`filesize`) VALUES ('.$room_id.',"'.$file['name'].'","'.$file['type'].'","'.$file['size'].'")';

    $stmt6 = $conn->prepare($sqlQuery6);
    $stmt6->execute();
}

//if ($stmt->errorInfo()[2] != "" || $stmt2->errorInfo()[2] != "" || $stmt3->errorInfo()[2] != ""){ 
//    logOutput($stmt->errorInfo()[2]);
//    echo '{"code":"1", "message": "'.$stmt->errorInfo()[2].'"}';
//    exit();
//    
//}else{
//    logOutput("success");
//    
//    
//    
//    if ($stmt3->errorInfo()[2] != ""){ 
//        logOutput($stmt3->errorInfo()[2]);
//        echo '{"code":"1", "message": "'.$stmt3->errorInfo()[2].'"}';
//        exit();
//    
//    }else{
//        
        
    
    echo '{"code":"0", "message": "New project created successfully"}';
   // }
//}


?>
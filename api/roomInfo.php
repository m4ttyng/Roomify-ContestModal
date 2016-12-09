<?php
require_once ("dbconnection.php");
//include db conn

$sqlQuery = "SELECT r.room_id, r.room_name, f.feature_id, f.feature_name
FROM rooms AS r INNER JOIN room_features AS rf ON r.room_id = rf.room_id
INNER JOIN features AS f ON rf.feature_id = f.feature_id
ORDER BY r.room_id";

$rs = $conn->query($sqlQuery);

if ($rs){
    
    $room = "";
    $output = "[";
    
    while ($row = $rs->fetch()){
        
        $roomName = $row['room_name'];
        $feature = $row['feature_name'];
        
        if ($room != $roomName){
            
            if ($room != ""){
                $output .= "]},";   
            }
            
            $output .= '{"roomType":"'.$roomName.'","features":[';
            $output .= '"'.$feature.'"';
            $room = $roomName;
            
            
        } else {
            
            $output .= ',"'.$feature.'"';
        }
    }
    
    //$output = substr($output, 0, -1);
    $output .= "]}]";
    
    echo $output;
}


?>
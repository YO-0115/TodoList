<?php 
  require_once('conn.php');
  header('Content-type:application/json;charset=utf-8');
  header('Access-Control-Allow-Origin: *');

  if(empty($_POST['token']) || empty($_POST['todo'])) {
    $json = array(
      "ok" => false,
      "message" =>"please input missing fields"
    );

    $response = json_encode($json);
    echo $response;
    die();
  }

  $token = $_POST['token'];
  $todo = $_POST['todo'];
 

  $sql = "INSERT INTO YO_w12_todolist(token, todo) VALUES(?, ?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('ss', $token, $todo);
  
  $result = $stmt->execute();
  if (!$result) {
    $json = array(
      "ok" => false,
      "message" => $conn->error
    );

    $response = json_encode($json);
    echo $response;
    die();
  }

  $json = array(
    "ok" => true,
    "message" => "success",
    "token" => $token
  );

  $response = json_encode($json);
  echo $response;
?>
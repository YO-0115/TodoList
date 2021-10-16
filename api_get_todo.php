<?php 
  require_once('conn.php');
  header('Content-type:application/json;charset=utf-8');
  header('Access-Control-Allow-Origin: *');

  if(empty($_GET['token'])) {
    $json = array(
      "ok" => false,
      "message" => "Please input your token"
    );

    $response = json_encode($json);
    echo $response;
    die();
  }

  $token = $_GET['token'];

  $sql = "SELECT id, token, todo FROM YO_w12_todolist WHERE token=?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('s', $token);
 
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

  $result = $stmt->get_result();
  $row = $result->fetch_assoc();

  $json = array(
    "ok" => true,
    "data" => array(
      "id" => $row['id'],
      "token" => $row['token'],
      "todo" => $row['todo']
    )
  );

  $response = json_encode($json);
  echo $response;
?>
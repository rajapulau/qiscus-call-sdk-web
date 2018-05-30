<?php

require 'vendor/autoload.php';

$app = new \Slim\App();
$container = $app->getContainer();

$container['CHAT_SDK_APP_ID'] = 'sdksample';
$container['CHAT_SDK_APP_SECRET'] = '2820ae9dfc5362f7f3a10381fb89afc7';
$container['CALL_SDK_APP_ID'] = 'sample-application-C2';
$container['CALL_SDK_APP_SECRET'] = 'KpPiqKGpoN';

$container['view'] = function($container) {
  return new \Slim\Views\PhpRenderer('./templates/');
};

$app->get('/', function($request, $response, $args) {
  return $this->view->render($response, 'index.phtml', [
    "CHAT_APP_ID" => $this->CHAT_SDK_APP_ID
  ]);
});
$app->get('/login', function($request, $response, $args) {
  $appId = $CHAT_SDK_APP_ID;
  return $this->view->render($response, 'login.phtml', [
    "CHAT_APP_ID" => $this->CHAT_SDK_APP_ID
  ]);
});
$app->post('/call', function($request, $response, $args) {
  $params = $request->getParams();
  $client = new \GuzzleHttp\Client();

  // get room id
  $res = $client->request('GET', 'http://' . $this->CHAT_SDK_APP_ID . '.qiscus.com/api/v2/rest/get_or_create_room_with_target?emails[]=' . $params['payload']['call_caller']['username'] . '&emails[]=' . $params['payload']['call_callee']['username'], [
    'headers' => [
      'Accept' => 'application/json',
      'Content-Type' => 'application/json',
      'QISCUS_SDK_SECRET' => $this->CHAT_SDK_APP_SECRET
    ]
  ]);
  $room = json_decode($res->getBody());

  // send system event
  $params['room_id'] = $room->results->room->id;
  $data = [
    'system_event_type' => $params['system_event_type'],
    'room_id' => (string)$params['room_id'],
    'subject_email' => $params['subject_email'],
    'message' => $params['message'],
    'payload' => [
      'type' => $params['payload']['type'],
      'call_event' => $params['payload']['call_event'],
      'call_room_id' => $params['payload']['call_room_id'],
      'call_is_video' => (bool)$params['payload']['call_is_video'],
      'call_caller' => [
        'username' => $params['payload']['call_caller']['username'],
        'name' => $params['payload']['call_caller']['name'],
        'avatar' => $params['payload']['call_caller']['avatar']
      ],
      'call_callee' => [
        'username' => $params['payload']['call_callee']['username'],
        'name' => $params['payload']['call_callee']['name'],
        'avatar' => $params['payload']['call_callee']['avatar']
      ]
    ]
  ];
  $res = $client->request('POST', 'http://' . $this->CHAT_SDK_APP_ID . '.qiscus.com/api/v2/rest/post_system_event_message', [
    'headers' => [
      'Content-Type' => 'application/json',
      'QISCUS_SDK_SECRET' => $this->CHAT_SDK_APP_SECRET
    ],
    'json' => $data
  ]);

  return $response->withJson(json_decode($res->getBody()));
});
$app->get('/room', function($request, $response, $args) {
  return $this->view->render($response, 'room.phtml', [
    "CALL_APP_ID" => $this->CALL_SDK_APP_ID,
    "CALL_APP_SECRET" => $this->CALL_SDK_APP_SECRET
  ]);
});

$app->run();

?>

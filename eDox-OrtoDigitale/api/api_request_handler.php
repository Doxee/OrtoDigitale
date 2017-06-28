/*
Copyright 2017 Doxee S.p.A.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
<?php

$response = array();
$response['success'] = false;
$response['message'] = '';
$response['data'] = null;

if(empty($_GET)) {
    $response['success'] = false;
    $response['message'] = 'empty data.';
    $encodedResponse = json_encode($response);
    echo $encodedResponse;
    die();
}

if(!isset($_GET['target_url']) || empty($_GET['target_url'])) {
    $response['success'] = false;
    $response['message'] = 'target_url not specified.';
    $encodedResponse = json_encode($response);
    echo $encodedResponse;
    die();
}


$targetUrl = $_GET['target_url'];

// Remove the target_url variable so the remaining parameters can be used to build the query to the api server
unset($_GET['target_url']);


//$data = array (
//    'q' => 'nokia'
//);
//
//$params = '';
//foreach($data as $key=>$value)
//    $params .= $key.'='.$value.'&';
//
//$params = trim($params, '&');

$params = '';
if(count($_GET) > 0) {
    $params = '?' . http_build_query($_GET);
}

$ch = curl_init();
$finalURL = $targetUrl.$params;
curl_setopt($ch, CURLOPT_URL, $finalURL); //Url together with parameters
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); //Return data instead printing directly in Browser
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT , 10); //Timeout after 7 seconds
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
//curl_setopt($ch, CURLOPT_USERAGENT , "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)");
curl_setopt($ch, CURLOPT_HEADER, 0);

$result = curl_exec($ch);

if(curl_errno($ch)) {
    $response['success'] = false;
    $response['message'] = 'Curl error: ' . curl_error($ch);
}
else {
    $response['success'] = true;
    $response['data'] = $result;
}

curl_close($ch);
$encodedResponse = json_encode($response);
echo $encodedResponse;
die();
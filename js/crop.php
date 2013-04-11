<?php

/**
 * Jcrop image cropping plugin for jQuery
 * Example cropping script
 * @copyright 2008-2009 Kelly Hallman
 * More info: http://deepliquid.com/content/Jcrop_Implementation_Theory.html
 */

if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
	$targ_w = $_POST['tw'];
	$targ_h = $_POST['th'];
	$jpeg_quality = 100;

	$src = "../" . $_POST['src'];

	$img_r = imagecreatefromjpeg($src);
	$dst_r = ImageCreateTrueColor( $targ_w, $targ_h);
	
	$path = "thumbs/";

	imagecopyresampled($dst_r,$img_r,0,0,$_POST['x'],$_POST['y'],
	$targ_w,$targ_h,$_POST['w'],$_POST['h']);
	$num = 0;
	do{
	
		$num++;
	}	
	while(file_exists($path . $_POST['name'].'-'.$num.'.jpg'));
	
	$namefile = $_POST['name'].'-'.$num.'.jpg';
	$name = $_POST['name'].'-'.$num;
	
	

	header('Content-type: image/jpeg');
	imagejpeg($dst_r, $path. $namefile,$jpeg_quality);
	
	$arr = array('id' => $name, 'name' => $_POST['name'], 'size' => $targ_w."x".$targ_h, 'url' => "js/" . $path . $namefile, 'type' => $_POST['type']);
	echo json_encode($arr);
}
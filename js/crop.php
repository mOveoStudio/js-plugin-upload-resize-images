<?php

/**
 * Jcrop image cropping plugin for jQuery
 * Example cropping script
 * @copyright 2008-2009 Kelly Hallman
 * More info: http://deepliquid.com/content/Jcrop_Implementation_Theory.html
 */

if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
	$targ_w = 300;
	$targ_h = 500;
	$jpeg_quality = 90;

	$src = $_POST['src'];
	$img_r = imagecreatefromjpeg($src);
	$dst_r = ImageCreateTrueColor( $_POST['w'], $_POST['h'] );

	imagecopyresampled($dst_r,$img_r,0,0,$_POST['x'],$_POST['y'],
	$_POST['w'],$_POST['h'],$_POST['w'],$_POST['h']);

	header('Content-type: image/jpeg');
	imagejpeg($dst_r,'yourfilename.jpg',$jpeg_quality);

}
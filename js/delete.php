<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST')
{

	var_dump($_POST);
	$file_to_delete = "../" . $_POST['url'];
	
	if(file_exists($file_to_delete)) 
		unlink($file_to_delete);
}
?>
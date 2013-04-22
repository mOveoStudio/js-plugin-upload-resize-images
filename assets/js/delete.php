<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
	$file_to_delete = "../../" . $_POST['url'];
	
	if(file_exists($file_to_delete)) 
		unlink($file_to_delete);
        else echo "File " . dirname(__file__) . $file_to_delete .  " doesn't exist";
}
?>
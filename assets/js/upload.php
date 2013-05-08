<?php
$UploadDirectory    = '../temp/'; //Upload Directory, ends with slash & make sure folder exist

if (!file_exists($UploadDirectory)) {
    //destination folder does not exist
    echo("Make sure Upload directory exist!");
}



    if(!isset($_FILES['fileUpload']))
    {
        //required variables are empty
        echo("File is empty!");
    }


    if($_FILES['fileUpload']['error'])
    {
        //File upload error encountered
        echo(upload_errors($_FILES['fileUpload']['error']));
    }

    $FileName           = strtolower($_FILES['fileUpload']['name']); //uploaded file name
    $ImageExt           = substr($FileName, strrpos($FileName, '.')); //file extension
    $FileType           = $_FILES['fileUpload']['type']; //file type
    $FileSize           = $_FILES['fileUpload']["size"]; //file size
    $RandNumber         = rand(0, 9999999999); //Random number to make each filename unique.
    $uploaded_date      = date("Y-m-d H:i:s");

    switch(strtolower($FileType))
    {
        //allowed file types
        case 'image/png': //png file
        case 'image/gif': //gif file
        case 'image/jpeg': //jpeg file
        case 'application/pdf': //PDF file
        case 'application/msword': //ms word file
        case 'application/vnd.ms-excel': //ms excel file
        case 'application/x-zip-compressed': //zip file
        case 'text/plain': //text file
        case 'text/html': //html file
            break;
        default:
            echo('Unsupported File!'); //output error
    }


    //File Title will be used as new File name
    $NewFileName = preg_replace(array('/s/', '/.[.]+/', '/[^w_.-]/'), array('_', '.', ''), strtolower($FileName));
    $NewFileName = $NewFileName.'_'.$RandNumber.$ImageExt;
   //Rename and save uploded file to destination folder.
   if(move_uploaded_file($_FILES['fileUpload']["tmp_name"], $UploadDirectory . $NewFileName ))
   {
        //connect & insert file record in database
        //$dbconn = mysql_connect($MySql_hostname, $MySql_username, $MySql_password)or echo("Unable to connect to MySQL");
        //mysql_select_db($MySql_databasename,$dbconn);
        //@mysql_query("INSERT INTO file_records (file_name, file_title, file_size, uploaded_date) VALUES ('$NewFileName', '$FileTitle',$FileSize,'$uploaded_date')");
        //mysql_close($dbconn);
		$arr = array('filename' => $NewFileName, 'imagesize' => getimagesize($UploadDirectory . $NewFileName) );
        echo json_encode($arr);

   }else{
        echo('error uploading File!');
   }


//function outputs upload error messages, http://www.php.net/manual/en/features.file-upload.errors.php#90522
function upload_errors($err_code) {
    switch ($err_code) {
        case UPLOAD_ERR_INI_SIZE:
            return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
        case UPLOAD_ERR_FORM_SIZE:
            return 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
        case UPLOAD_ERR_PARTIAL:
            return 'The uploaded file was only partially uploaded';
        case UPLOAD_ERR_NO_FILE:
            return 'No file was uploaded';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Missing a temporary folder';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Failed to write file to disk';
        case UPLOAD_ERR_EXTENSION:
            return 'File upload stopped by extension';
        default:
            return 'Unknown upload error';
    }
}
?>
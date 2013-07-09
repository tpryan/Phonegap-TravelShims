#device.sh
project=$1;
username=$2;
password=$3;
projectPath=$4;
pathToDeviceInstaller=$5;

APIPATH="https://build.phonegap.com/api/v1/apps";
FILEPATH="https://build.phonegap.com/apps/";

APIcall="$APIPATH/$project"
creds="$username:$password";

cd $projectPath

##Request Phonegap data
echo "Requesting Project Data.";
package=$(curl -s -u $creds  $APIcall | sed -e 's/^.*"package":"\([^"]*\)".*$/\1/');
title=$(curl -s -u $creds  $APIcall | sed -e 's/^.*"title":"\([^"]*\)".*$/\1/');
title=${title##*:};
title=$(echo $title|sed 's/,//g');
title=$(echo $title|sed 's/"//g');
title=$(echo $title|sed 's/ //g');
package=${package##*:};
package=$(echo $package|sed 's/,//g');
package=$(echo $package|sed 's/"//g');
echo "Done. ";


echo "Waiting for rebuild to be done.";
donecheck=$(curl -s -u $creds  $APIcall | grep -c '"android":"complete"');	

while [ $donecheck != 1 ]
do
	echo ".";
	sleep 10;
	donecheck=$(curl -s -u $creds  $APIcall | grep -c '"android":"complete"');	
	
done
echo "Done. Now downloading.";


##Download File
download=$(curl -L -s -u $creds -o $title.apk $APIPATH/$project/android);

echo "Done. Now installing.";
##Install on Device
$pathToDeviceInstaller uninstall $package
$pathToDeviceInstaller install -r $projectPath/$title.apk

echo "Done.";
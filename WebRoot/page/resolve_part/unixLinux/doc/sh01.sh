#!/bin/bash
#programme:update nginx config file and service nginx reload
#call-method1:sh shellFileName 1 domainName appUrl                #add domainName and appUrl relation
#call-method2:sh shellFileName 2 domainName newDomainName         #modify domainName to newDomainName
#call-method3:sh shellFileName 3 domainName                       #query domainName is alreadyBind
#call-method3:sh shellFileName 4 domainName                       #delete domainName from configFile
#2015-01-29 yougang.ning
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

secondDomainName=.x.newtouch.com
nginxConfigFileName=/etc/nginx/conf.d/vhost1.conf
operType=$1
if [ $operType -eq 1 ]
then
   domainName=$2
   appUrl=$3  
   if [ -z $domainName ]||[ $domainName = "" ]||[ -z $appUrl ]||[ $appUrl = "" ]
   then
    errormsg="fail:domainName or appUrl is null,parameter is invalid"
    logger -s $errormsg
    echo $errormsg
    exit 1 #exist pragramme
   fi
elif  [ $operType -eq 2 ] 
then
   domainName=$2
   newDomainName=$3
   if [ -z $domainName ]||[ $domainName = "" ]||[ -z $newDomainName ]||[ $newDomainName = "" ]
   then
    errormsg="fail:domainName or newDomainName is null,parameter is invalid"
    logger -s $errormsg
    echo $errormsg
    exit 1
   fi
else
    domainName=$2
    if [ -z $domainName ]||[ $domainName = "" ]
    then
      errormsg="fail:domainName is null,parameter is invalid"
      logger -s $errormsg
      echo $errormsg
      exit 1
    fi
fi

domainName=http://$2$secondDomainName
getRowNumCommand="awk '/http:\/\/$2$secondDomainName/ {print NR}' $nginxConfigFileName"
numrow=$(eval $getRowNumCommand)

if [ $operType -eq 1 ] #add domainName and appUrl relation
then  
    if [ -z $numrow ]
    then  #Not exist domain,insert action,must backup
       latestDate=$(date +%s)
       backCommand="cp $nginxConfigFileName $nginxConfigFileName$latestDate"
       logger -s $backCommand
       eval $backCommand
       firstNumrow=$(($(awk '/location \// {print NR}' $nginxConfigFileName)+1))
       before=i
       insertCommand="sed -i  '$firstNumrow$before if (\$domain ~* \"$domainName\") {\n proxy_pass $appUrl\$request_uri;\n}'  $nginxConfigFileName"
       logger -s $insertCommand
       eval $insertCommand
       reloadCmd="service nginx reload"
       eval $reloadCmd
       exit 0 #exist pragramme
    else #exist domain,can't execute insert action ,give tip message to client
       errormsg="fail:nginx config exist domain,can not execute insert action"
       logger -s $errormsg
       echo $errormsg
       exit 1
    fi
elif  [ $operType -eq 2 ]   #modify domainName to newDomainName
then
    if [ -z $numrow ]
    then  #not exist domain to update,can't execute update action,give tip message to client
       errormsg="not exist domain to update,can not execute update action"
       logger -s $errormsg
       echo $errormsg
       exit 1
    else  #exist,update action,must backup
       latestDate=$(date +%s)
       backCommand="cp $nginxConfigFileName $nginxConfigFileName$latestDate"
       logger -s $backCommand
       eval $backCommand
       replaceCommand="sed -i  's/http:\/\/$2$secondDomainName/http:\/\/$3$secondDomainName/' $nginxConfigFileName"
       logger -s $replaceCommand
       eval $replaceCommand
       reloadCmd="service nginx reload"
       eval $reloadCmd
       exit 0 
    fi
elif  [ $operType -eq 3 ] #query domainName is alreadyBind
then
   if [ -z $numrow ]
   then
       message="$domainName NotBind"
       echo $message
       exit 0
   else
       message="$domainName alreadyBind"
       echo $message
       exit 0
   fi
else  #delete domainName from configFile
   if [ -z $numrow ]
   then
       message="$domainName NotBind,can not execute delete action"
       echo $message
       exit 0
   else
       latestDate=$(date +%s)
       backCommand="cp $nginxConfigFileName $nginxConfigFileName$latestDate"
       logger -s $backCommand
       eval $backCommand
       deleteCmd="sed -i '$numrow,$((numrow+2))d' $nginxConfigFileName"
       logger -s $deleteCmd
       eval $deleteCmd
       reloadCmd="service nginx reload"
       logger -s $reloadCmd
       eval $reloadCmd
       exit 0
   fi
fi

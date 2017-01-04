function changeChart(url,type) {
       getSWF("picDemo").changeChart4j(url,type);
   }
function getSWF(movieName){
   if (navigator.appName.indexOf("Microsoft") != -1){
       return window[movieName]
   }
   else {
       return document[movieName]
   }
  }
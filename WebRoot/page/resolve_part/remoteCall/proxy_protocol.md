### 一、获取客户端真实ip场景
在我们很多场景中，例如后台的真实服务(如tomcat等)，需要获取真实的用户ip地址。
然而由于前端的负载均衡器种类繁多，如有基于TCP协议的负载均衡器，也有基于http/https协议的负载均衡器。
也有同时支持两种类型的。这就给后台服务获取客户端ip地址造成了困难

### 二、没有负载均衡器(用户->backend server)，如何获取客户端ip地址
在后台的代码中, 可以直接通过http头部:remote address获取
```
[irteamsu@dev-lambda-jenkins.ncl bin]$ curl http://10.105.170.69:10001/api/v1/web/lambda/default/hello-web.json
{
  "response": {
    "__ow_method": "get",
    "__ow_headers": {
      "remote-address": "10.110.220.92:44360",   #this is client-real-ip
      "user-agent": "curl/7.29.0",
      "host": "10.105.170.69:10001", 
      "accept": "*/*"
    },
    "__ow_path": ""
  }
}
```
备注:
* 如果是用akka-http，需要做:remote-address-header = on。或许其他http框架也需要做类似的设置。
* 可以看出，如果是经过了负载均衡器，获取的remote address地址是负载均衡器的地址。

### 三、针对7层协议(http/https)的负载均衡器(用户->nginx->backend server)，如何获取ip地址
针对负载均衡器，比如nginx，可以设置http头:X-Forwarded-For，比如
```
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```
当请求最后被backend server处理后，返回的结果:
```
[irteamsu@dev-lambda-jenkins.ncl ~]$ curl https://lambda-exp.navercorp.com/api/v1/web/lambda/default/hello-web.json
{
  "response": {
    "__ow_method": "get",
    "__ow_headers": {
      "accept": "*/*",
      "user-agent": "curl/7.29.0",
      "host": "lambda-exp.navercorp.com",
      "remote-address": "10.105.170.69:41420",
      "x-real-ip": "10.105.207.32",
      "connection": "close",
      "x-forwarded-for": "MyClientIp, Proxy1,....,ProxyN"
    },
    "__ow_path": ""
  }
}
```    
X-Forwarded-For历史:http://blog.csdn.net/u013982161/article/details/55813860

### 四、针对4层协议(tcp)的负载均衡器(用户->4层负载均衡器->backend server)，如何获取ip地址
由于在4层协议对应的tcp包无法识别类似http头部的X-Forwarded-For，所以`haproxy project`开发了`Proxy Protocol`来解决
这个问题，后来Amazon的ELB在2013年也引入了这个特性，nginx的1.5.12发布版本也加入了这个特性。
具体详见:https://chrislea.com/2014/03/20/using-proxy-protocol-nginx/

### 五、其他解决办法
Naver公司在4层负载均衡器中引入了`DSR`机制，来隐藏负载均衡自己的真实信息。这样后台服务可以通过remote address头部来获取。
`DSR`有点像`LVS`中的`DR`(NAT、DR、TUN)，lvs修改目标mac地址为real server的mac，并将真实服务器的回环地址修改为VIP，同时
调整相关内核参数。

### 六、nginx proxy protocol配置样例
```
server {
        listen 8443 default ssl proxy_protocol;
        access_log /logs/nginx_access.log combined-upstream-proxy;

        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $proxy_protocol_addr;
        proxy_set_header X-Forwarded-For $proxy_protocol_addr;

        # match namespace, note while OpenWhisk allows a richer character set for a
        # namespace, not all those characters are permitted in the (sub)domain name;
        # if namespace does not match, no vanity URL rewriting takes place.
        server_name ~^(?<namespace>[0-9a-zA-Z-]+)\.{{ whisk_api_localhost_name | default(whisk_api_host_name) | default(whisk_api_localhost_name_default) }}$;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  10m;
        ssl_certificate      /etc/nginx/{{ nginx.ssl.cert }};
        ssl_certificate_key  /etc/nginx/{{ nginx.ssl.key }};
        {% if nginx.ssl.password_enabled %}
        ssl_password_file   "/etc/nginx/{{ nginx.ssl.password_file }}";
        {% endif %}
        ssl_client_certificate /etc/nginx/{{ nginx.ssl.client_ca_cert }};
        ssl_verify_client {{ nginx.ssl.verify_client }};
        ssl_protocols        TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers RC4:HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        proxy_ssl_session_reuse off;

        # proxy to the web action path
        location / {
            if ($namespace) {
              rewrite    /(.*) /api/v1/web/${namespace}/$1 break;
            }
            proxy_pass http://controllers;
            proxy_read_timeout 70s; # 60+10 additional seconds to allow controller to terminate request
        }

        # proxy to 'public/html' web action by convention
        location = / {
            if ($namespace) {
              rewrite    ^ /api/v1/web/${namespace}/public/index.html break;
            }
            proxy_pass http://controllers;
            proxy_read_timeout 70s; # 60+10 additional seconds to allow controller to terminate request
        }

        location /blackbox.tar.gz {
            return 301 https://github.com/apache/incubator-openwhisk-runtime-docker/releases/download/sdk%400.1.0/blackbox-0.1.0.tar.gz;
        }
        # leaving this for a while for clients out there to update to the new endpoint
        location /blackbox-0.1.0.tar.gz {
            return 301 /blackbox.tar.gz;
        }

        location /OpenWhiskIOSStarterApp.zip {
            return 301 https://github.com/apache/incubator-openwhisk-client-swift/releases/download/0.2.3/starterapp-0.2.3.zip;
        }

        location /cli/go/download {
            autoindex on;
            root /etc/nginx;
        }

        # provide healcheck url to L4:/monitor/l7check.nhn
        location /monitor {
            root /etc/nginx/;
            expires off;
        }
    }
```
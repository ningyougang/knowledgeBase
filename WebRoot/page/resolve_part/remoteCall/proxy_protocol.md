### һ����ȡ�ͻ�����ʵip����
�����Ǻܶೡ���У������̨����ʵ����(��tomcat��)����Ҫ��ȡ��ʵ���û�ip��ַ��
Ȼ������ǰ�˵ĸ��ؾ��������෱�࣬���л���TCPЭ��ĸ��ؾ�������Ҳ�л���http/httpsЭ��ĸ��ؾ�������
Ҳ��ͬʱ֧���������͵ġ���͸���̨�����ȡ�ͻ���ip��ַ���������

### ����û�и��ؾ�����(�û�->backend server)����λ�ȡ�ͻ���ip��ַ
�ں�̨�Ĵ�����, ����ֱ��ͨ��httpͷ��:remote address��ȡ
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
��ע:
* �������akka-http����Ҫ��:remote-address-header = on����������http���Ҳ��Ҫ�����Ƶ����á�
* ���Կ���������Ǿ����˸��ؾ���������ȡ��remote address��ַ�Ǹ��ؾ������ĵ�ַ��

### �������7��Э��(http/https)�ĸ��ؾ�����(�û�->nginx->backend server)����λ�ȡip��ַ
��Ը��ؾ�����������nginx����������httpͷ:X-Forwarded-For������
```
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```
���������backend server����󣬷��صĽ��:
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
X-Forwarded-For��ʷ:http://blog.csdn.net/u013982161/article/details/55813860

### �ġ����4��Э��(tcp)�ĸ��ؾ�����(�û�->4�㸺�ؾ�����->backend server)����λ�ȡip��ַ
������4��Э���Ӧ��tcp���޷�ʶ������httpͷ����X-Forwarded-For������`haproxy project`������`Proxy Protocol`�����
������⣬����Amazon��ELB��2013��Ҳ������������ԣ�nginx��1.5.12�����汾Ҳ������������ԡ�
�������:https://chrislea.com/2014/03/20/using-proxy-protocol-nginx/

### �塢��������취
Naver��˾��4�㸺�ؾ�������������`DSR`���ƣ������ظ��ؾ����Լ�����ʵ��Ϣ��������̨�������ͨ��remote addressͷ������ȡ��
`DSR`�е���`LVS`�е�`DR`(NAT��DR��TUN)��lvs�޸�Ŀ��mac��ַΪreal server��mac��������ʵ�������Ļػ���ַ�޸�ΪVIP��ͬʱ
��������ں˲�����

### ����nginx proxy protocol��������
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
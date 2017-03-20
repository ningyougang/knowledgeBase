###  从主机访问docker容器的方式
* docker attach: 多个窗口， 容易卡死 
* docker exec: 用得较为普遍
* ssh 方式:需要在容器中启动sshd，存在开销和攻击面增大的问题。同时也违反了Docker所倡导 
的一个容器一个进程的原则
* nsenter:

```
docker inspect --format "{{ .State.Pid }}" <containerId>
nsenter --target ${Pid} --mount --uts --ipc --net --pid
```

please refer to: 
  * https://github.com/jpetazzo/nsenter
  * http://www.oschina.net/translate/enter-docker-container?print

### 重点说明nsenter
在我们项目中，有个想需求，需要在容器中挂载一个卷，该挂载记录需要被容器的宿主主机看到，而nsenter可以
实现该需求，请参考:http://michaelneale.blogspot.kr/2015/02/mounting-devices-host-from-super.html
* 启动一个容器

 ```
docker run  -t  --net=host --privileged=true --name=ceph-docker-plugin \ #特权方式启动
-v /proc:/media/proc \      #需要将宿主主机的/proc目录共享到容器内
-v /var/run/docker/plugins:/var/run/docker/plugins \
-v /var/lib/docker/containers:/var/lib/docker/containers \
-v /var/lib/ceph/mount:/var/lib/ceph/mount \
-v /var/log/messages:/var/log/messages \
-v /etc/ceph:/etc/ceph \
-v /etc/octopus/config.json:/etc/octopus/config.json \
-v /etc/hosts:/etc/hosts \
-v /dev:/dev \   #需要将主机的/dev目录共享到容器内
-v /sys:/sys \
${容器镜像} bash
 ```
* 在容器内部通过nsenter进行挂载

 ```
 nsenter --mount=/media/proc/1/ns/mnt -- mount /dev/rbd0 /var/lib/ceph/mount/test/
 ```

* 在宿主主机外部通过root用户执行mount命令可以查看到挂载记录

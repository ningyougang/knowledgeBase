* download go pkg from https://storage.googleapis.com/golang/
* edit $HOME/.bash_profile (add GOPATH, GOROOT, PATH)

    ```
    $ yum install -y wget git gcc-go
    $ mkdir $HOME/bin
    $ cd $HOME/bin
    $ wget https://storage.googleapis.com/golang/go1.7.1.linux-amd64.tar.gz
    $ tar xvfz go1.7.1.linux-amd64.tar.gz
    
    $ vi $HOME/.bash_profile
    GOROOT=$HOME/bin/go
    export GOROOT
    GOPATH=$HOME/go_workspace
    export GOPATH
    PATH=$PATH:$HOME/bin:$GOROOT/bin
    export PATH
    ```

* check go version

    ```
    [root@localhost ceph]# go version
    $ go version go1.7.1 linux/amd64
    ```
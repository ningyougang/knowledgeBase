### Using shift to remove the parameter with while/case

```bash
#!/bin/bash

HELP_MESSAGE=$(
cat << 'EOF-heredoc'
Usage:
  sh deploy.sh [options] environment

Options:
    --all-in-one                            Deploy on multiple nodes default
    --upgrade                               Don't upgrade default when deploy
    --reconfigure                           Generate config and restart container
    --openstack-release <openstack-version> Specify openstack version to deploy
    --help, -h                              Show this help information

Available environment:
    exp/dev/prod-dev/prod-prod
EOF-heredoc
)

while :; do
    case $1 in
        -h|-\?|--help)   # Display a synopsis, then exit.
            echo "$HELP_MESSAGE"
            exit
            ;;
        --all-in-one)       # Takes an option argument, ensuring it has been specified.
            all_in_one=true
            shift
            ;;
        --upgrade)       # Takes an option argument, ensuring it has been specified.
            upgrade=true
            shift
            ;;
        --reconfigure)       # Takes an option argument, ensuring it has been specified.
            reconfigure=true
            shift
            ;;
        --openstack-release) # Get openstack-release
            openstack_release=$2
            shift 2
            ;;
        --)              # End of all options.
            shift
            break
            ;;
        -?*)
            printf 'WARN: Unknown option (ignored): %s\n' "$1" >&2
            ;;
        *)               # Default case: If no more options then break out of the loop.
            break
    esac
done
```
注意事项:
* shift:移动参数，shift(shift 1) 命令每执行一次，变量的个数($#)减1(之前的$1变量被销毁,之后的$2就变成了$1)，而变量值提前一位。同理，shift n后，前n位参数都会被销毁。
* shell中的while语法:

```bash
while [ expression ]
do
  程序段
done
```
* shell种的case语法:

```bash
case 字符串表达式 in  
  "值1")  
    程序块儿  
    ;; #跳出case结构,相当于break;  
  "值2")  
    程序块儿  
    ;;  
   ...  
  *)  
    程序块儿 (不满足以上所有条件)  
    ;;  
esac  
```

### Using getopts with while/case

```bash
help() {
    echo "sh build.sh [OPTIONS] -t TYPE -v VERSION"
    echo "    -h         Print usages"
    echo "    -o         enable octopus/base build"
    echo "    -b         enable build image ceph-docker-plugin"
    echo "    -c         enable create plugin ceph-docker-plugin"
    echo "    -p         enable push image/plugin to repository"
    echo "    -t TYPE    ncloud/test/prod-dev/prod-prod"
    echo "    -v VERSION Plugin Version (tag) "
    exit 0
}

ENABLE_OCTOPUS_BASE=false
ENABLE_BUILD_PLUGIN=false
ENABLE_CREATE_PLUGIN=false
ENABLE_PUSH=false
WORKSPACE=/opt/octopus-plugin

if [ $# -eq 0 ] ; then
    help 
fi

while getopts "t:v:obcph" opt
do
    case $opt in
        t) TYPE=$OPTARG
          ;;
        v) VERSION=$OPTARG
          ;;
        o) ENABLE_OCTOPUS_BASE=true
          ;;
        b) ENABLE_BUILD_PLUGIN=true
          ;;
        c) ENABLE_CREATE_PLUGIN=true
          ;;
        p) ENABLE_PUSH=true
          ;;
        h) help ;;
        ?) help ;;
    esac
done
```
注意事项:
* 语法:getopts [option[:]] VARIABLE，通常与while结合获取shell命令行参数,如果某个option后面出现了冒号(":")，则表示这个选型后面可以接参数,
VARIABLE：表示将某个选项保存在变量VARIABLE中。
* getopts还包含两个内置变量，及OPTARG和OPTIND,OPTARG就是将选项后面的参数值保存在这个变量当中，OPTIND：这个表示命令行的下一个选项或参数的索引（文件名不算选项或参数）
* shell特殊变量
  * $0:当前脚本名
  * $n:传给给脚本或函数的第n个参数，如:./script.sh a1 a2 a3，其中$0为script.sh，$1为a1，$2为a2，$3为a3。
  * $#:传递给脚本或函数的参数个数。
  * $?:上命令的退出状态，一般0为正常状态，非0为异常状态。
  * $$:当前shell进程ID，对于Shell 脚本，就是这些脚本所在的进程ID。

参考文章:
* http://blog.csdn.net/swandy45/article/details/8191503
* http://xslwahaha.blog.51cto.com/4738972/1574548

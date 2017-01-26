## 前置
* 学习网站: http://www.runoob.com/
* markdown在线编辑: http://dillinger.io/

## java/python/go比较点
* 一、静态语言/动态语言
* 二、函数式编程
* 三、接口/继承/类
* 四、数据类型
* 五、访问权限
* 六、异常处理
* 七、依赖
* 八、细节不同处

## 一、静态语言/动态语言
### 1.知识点说明:
* 静态类型语言：指在编译期间就去做数据类型检查，也就是说在编码时要声明数据类型。如java/c/c++。
* 动态类型语言：指在运行期间才去做数据类型检查。如python/javascript．

### 2.java/python/go区别
* java:静态类型的语言，声明变量时必须申请变量类型.

    ```
    List list = new ArrayList();
    ```
* python:动态类型的语言，不用申明，在运行期确定

    ```
    list = [1,2,3]
    ```
* go:本质上还是静态类型的语言，但是结合了动态类型语言的特点，可以不用声明变量类型。
  * 第一种，指定变量类型
  
      ```
      var a int = 10
      ```
  * 第二种，省略变量类型，根据值自动判断
  
      ```
      var a = 10
      ```
  * 第三种，省略var，通过:=赋值，左侧的变量必须没有经过声明，否则会导致编译错误
  
      ```
      b := 10
      ```    
      
## 二、函数式编程
### 1.知识点说明:
* 函数式编程定义:"函数式编程"是一种"编程范式"（programming paradigm），也就是如何编写程序的方法论,
它属于"结构化编程"的一种，主要思想是把运算过程尽量写成一系列嵌套的函数调用。在函数式编程中，函数为一等
公民，指函数与其他数据类型一样，处于平等的地位，可以赋予给其他变量。支持闭包等高级特性。

### 2.java/python/go在函数式编程上的支持程度:
* java在函数式编程中一直支持较弱,java8中引入的Lambda，待详细研究
* python完全支持函数式编程
* go也完全支持函数式编程

## 三、接口/继承/类
### 1.知识点说明:
* 接口:接口为类的抽象，是更高层次，更宏观的一种抽象，定义若干未实现的方法。
* 抽象类:抽象类的抽象程度介于接口和类之间，部分定义接口，部分实现方法。在java中的模板设计模式中较常用。
* 类:实例的抽象。

### 2.java/python/go在接口，类，以及继承方面的区别:
* java中的类是单继承的，但是可以实现若干接口。接口可以是多继承的。
  * 类:单继承一个类，实现多个接口
  
    ```
    public class Hero extends ActionCharacter implements CanFight,CanFly,CanSwim{
        public void fly() {
        }
    
        public void swim() {
        }
    }
    ```
  * 接口:多继承若干个接口
  
    ```
    interface Fa extends FirstFa,SecondFa{
    }
    ```  
* python存在类，不存在接口的概念，所以必须多继承  

    ```
    class D(C1,C2):
        pass
    ```  
* go中不存在class，通过类型系统的struct来实现类似class的功能,go中存在接口的概念，但是不用像java需要用implements
关键字来说明，只需要实现方法就可以了,请参考:http://www.runoob.com/go/go-interfaces.html,
go中没有继承这个概念，可以用组合来模拟多继承,请参考:http://www.01happy.com/golang-oop/,http://studygolang.com/articles/2521。

## 四、数据类型
* java的数据类型包含8种基本数据类型，在加对象类型
  * 基本数据类型:
    * 第一类整形(4种):byte short int long
    * 第二类浮点型(2种):float double
    * 第三类布尔型(1种):boolean(只有true、false两种取值)
    * 第四类字符型(1种):char
  * 对象类型，其中基本数据类型可以通过装箱机制转化为对象类型  
* python支持5个标准的数据类型和高级数据类型,请参考:http://www.runoob.com/python/python-variable-types.html
  * 五个标准的数据类型
    * Numbers(数字)，可以再分，支持4种不同类型的数字类型,int(有符号整形),long(长整形),float(浮点型),complex(复数)
    * String (字符串)  
    * List(列表)
    * Tuple(元组)
    * Dictionary(字典)
  * 高级数据结构，请参考:http://blog.jobbole.com/65218/  
* go包含布尔类型，数字类型，字符串类型，派生类型，其中派生类型又包括指针类型，数组类型，结构化类型等，
请参考:http://www.runoob.com/go/go-data-types.html  

## 五、访问权限
* 在java中，被访问的“对象”包含类的成员(变量和方法)和类本身。
  * 类的成员(变量和方法)，有4个修饰符，分别为:private、无(包访问权限)、protected、public。
请参考:http://www.cnblogs.com/ldq2016/p/5261345.html      
  * 类,仅包含public和无(即包访问权限)两种，没有private和protected(内部类特例除外)    
* 在python中，没有java分得那么仔细。是因为python有个宗旨是信任程序员，所以好多黑客转型用python.
  * python中以双下划线__开头的成员， 表示私有的，否则是公有的。(__XX__类型除外)。
  * python中对实例变量的赋值，可以直接赋值，如p.propertyA = 12，因为在python中，属性和方法都是同等地位的，
  而且不像java那样，属性和方法是不对等的，属性一般设置为private，通过getter/setter进行取值/赋值
  * python中全局变量的声明和函数局部变量声明始终是分开的，如果函数内部要修改全局变量，需要用global关键字，
  不存在优先级的概念。请参考:http://www.cnblogs.com/snake-hand/archive/2013/06/16/3138866.html
* 在go中，也没有java分得那么仔细。
  * go中成员大写开头的为public权限，小写的为private权限。成员包括:常量、变量、类型、接口、结构、函数
  * go语言中的全局变量和函数内的局部变量名称可以相同，但是有先考虑局部变量,go函数中修改外部变量不需要用类似python中的global。
  
## 六、异常处理
* 在java中，异常体系复杂。
  * 所有异常都继承自Throwable，它有两个重要子类，Error和Exception，其中Error表示程序无法处理的错误，如内存溢出。
    Exception又分为运行时异常(不可检查异常，如除以0)和检查类异常(各种IOException)。
  * 通过try...catch...finally处理。
  * 在web应用中，一般分为3层架构，action、service、dao。其中dao层将异常封装为运行时异常，
  service层封装为与具体业务相关的可以捕获的检查类异常，并且一般是继续往action层抛，在action这一层捕获业务异常，
  然后模仿http协议(参考:http://www.w3school.com.cn/tags/html_ref_httpmessages.asp)，封装成状态码为response写入。
* python异常处理与java相似，通过try...except...finally...else处理，
请参考: http://www.runoob.com/python/python-exceptions.html，对于打开的IO资源，还可以通过with来处理，自动释放.
* go的异常处理比java和python更为简洁，请参考:http://blog.csdn.net/wuwenxiang91322/article/details/9042503，待仔细研究

## 六、依赖
* 在java中，java依赖的jar包，将其放到${CLASSPATH}下
* 在python中，python依赖的package，放到/usr/lib/python2.7/site-packages/下
* 在go中，go直接依赖源码，可以通过godep在结合go自身的vendor来管理，参见:https://github.com/tools/godep，比如:

  ```
  go get github.com/tools/godep  (下载到${GOPATH}/pkg下面，然后安装到${GOPATH}/bin下面)
  cp ${GOPATH}/bin/godep /usr/local/bin  (拷贝到path下面)
  sudo yum install  -y librados2-devel and librbd1-devel #或许需要这步,go连注释的代码也会扫描
  go get ${remoteLibUrl}
  godep save 
  ```
  
  说明:godep save:在未指定包名的情况下，godep会自动扫描当前目录所属包中import的所有外部依赖库（非系统库），
并查看其是否属于某个代码管理工具（比如git，hg）。若是，则把此库获取路径和当前对应的revision（commit id）记录到当前目录
Godeps下的Godeps.json，同时，把不含代码管理信息（如.git目录）的代码拷贝到Godeps/_workspace/src下，
用于后继godep go build等命令执行时固定查找依赖包的路径。
因此，godep save能否成功执行需要有两个要素：
  * 当前或者需扫描的包均能够编译成功：因此所有依赖包事先都应该已经或go get或手工操作保存到当前GOPATH路径下
  * 依赖包必须使用了某个代码管理工具（如git，hg）：这是因为godep需要记录revision  
  
## 七、细节不同处
* 代码块
  * java是以大括号来划分代码块。
  * python是以冒号+缩进来划分代码块。
  * go与java类似，通过大括号来划分代码块
* 声明变量、函数定义
  * java是静态语言，必须声明，并且变量类型在变量前面。
  * python是动态语言，不用声明变量类型。
  * go，声明变量时可以声明变量类型也可以不用声明，更奇葩的是变量类型在变量的后面，函数返回值也定义在后面。
函数的参数列表有一个简便写法，当连续两个或多个函数的已命名形参类型相同时，除最后一个类型以外，其它都可以省略。 
请参考:http://www.yinwang.org/blog-cn/2014/04/18/golang (大神对go的评价，但看不太懂)
* this
  * java中this表示当前对象，不用通过形参传入(隐式传入)
  * python中，实例方法,通过第一个形参传入，一般命名为:self，如果为类方法，结合@classmethod,第一个形参一般命名为:cls.
  * go中没有this。一般用做变量。
  
    ```
    func (this *MyStruct)GetName() string {
        return this.name
    }
    ```
* 返回值
  * java只有1个返回值，如果需要返回多个返回值，可以通过Map来变相模拟
  * python也只有1个返回值，如果需要返回多个返回值，可以通过元祖来模拟
  * go可以真正的有多个返回值    
* 定义常量
  * 在java中，在接口，类，枚举中均可以定义，请参考:http://blog.csdn.net/autofei/article/details/6419460
  * 在python中，没有入const的关键字，可以变通实现，请参考:http://www.cnblogs.com/Vito2008/p/5006255.html
  * 在go中通过关键字const来定义
  
    ```
    const a string = "abc"
    const b int = 5 或
    const (
        Unkonw =0
        Female = 1
        Male = 2
    )
    ```
* 实例方法/静态方法/类方法
  * java中只有类方法(通过static修饰，也可以叫静态方法)和实例方法，类方法类和实例均可以访问，实例方法只有实例可以访问.
  * python中有实例方法/静态方法/类方法，请参考:http://blog.csdn.net/chendong_/article/details/52180310
  * go中貌似不存在静态方法和类方法的说法。
* 实例化对象的过程以及方式
  * java中通过new操作符+与类同名的构造函数进行实例化,如Person p = new Person();
  * python中通过"类名()"来实例化：首先调用def __new__(cls,[...])进行实例化，然后调用def __init__(self,[...])进行成员变量赋值.
  * go中主要是如何实例化struct,加&符号和new的是指针对象，没有的则是值对象,请参考:http://blog.haohtml.com/archives/14239
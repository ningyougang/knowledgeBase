### /dev/null
* 解释:外号叫无底洞，你可以向它输出任何数据，它通吃，并且不会撑着！官方解释:在类Unix系统中，/dev/null，或称空设备，是一个特殊的设备文件，
它丢弃一切写入其中的数据（但报告写入操作成功），读取它则会立即得到一个EOF。在程序员行话，尤其是Unix行话中，
/dev/null 被称为位桶(bit bucket)或者黑洞(black hole)。空设备通常被用于丢弃不需要的输出流，或作为用于输入流的空文件。这些操作通常由重定向完成。
* 使用场景
  * 禁止标准输出: cat $filename >/dev/null
  * 禁止标准错误: rm $badname 2>/dev/null
  * 禁止标准输出和标准错误的输出: cat $filename 2>/dev/null >/dev/null(如果"$filename"不存在，将不会有任何错误信息提示.如果"$filename"存在, 文件的内容不会打印到标准输出.)
  * 清空日志文件: cat /dev/null > /var/log/messages
  * 所有的cookie丢入黑洞而不保存到磁盘上:ln -s /dev/null ~/.netscape/cookies
 
### /dev/zero
* 解释: 在类UNIX 操作系统中, /dev/zero 是一个特殊的文件，当你读它的时候，它会提供无限的空字符, 其中的一个典型用法是用它提供的字符流来覆盖信息，
另一个常见用法是产生一个特定大小的空白文件。
* 使用场景:dd if=/dev/zero of=${file} bs=4M count=500，在当前目录产生一个2G的空文件。

### loop device
* 解释: 在类UNIX系统里，loop设备是一种伪设备(pseudo-device)，或者也可以说是仿真设备。它能使我们像块设备一样访问一个文件。
在使用之前，一个 loop设备必须要和一个文件进行连接。这种结合方式给用户提供了一个替代块特殊文件的接口。
因此，如果这个文件包含有一个完整的文件系统，那么这个文件就可以像一个磁盘设备一样被mount 起来。
* 使用方法:
  * 创建1个2G的空文件: dd if=/dev/zero of=loopfile bs=4M count=500
  * 使用losetup创建1个loop device: losetup /dev/loop0 loopfile
  * 创建文件系统:mkfs.ext4 /dev/loop0
  * 挂载这个文件系统:mount /dev/loop0 /mnt/ (上面两条命令等价于:mount -o loop loopfile /mnt/loopback)
  * 最后如果要删除刚才创建的这些对象:umount /dev/loop0, losetup -d /dev/loop0, rm loopfile

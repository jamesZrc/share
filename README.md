/usr/local/bin/wdfs

# 列根目录
wdfs ls

# 列子目录
wdfs ls /ffff

# 新建多级目录
wdfs mkdir /ffff/docs/2026

# 新建空文件
wdfs touch /ffff/readme.txt

# 上传
wdfs put ./report.xlsx                          # 上传到根目录，同名
wdfs put ./report.xlsx /ffff/docs/report.xlsx   # 指定远程路径
wdfs put ./a.apk /ffff/test/                    # 上传到子目录

# 下载
wdfs get /ffff/report.xlsx                # 下载到当前目录
wdfs get /ffff/report.xlsx ./local.xlsx   # 指定本地名

# 查看文件内容
wdfs cat /ffff/readme.txt

# 用 vim 编辑远程文件（保存后自动回传）
wdfs edit /ffff/readme.txt

# 删除
wdfs rm /ffff/old.txt
wdfs rm /ffff/old-dir/

# 重命名/移动
wdfs mv /ffff/old.txt /ffff/new.txt
wdfs mv /ffff/a.txt /ffff/docs/a.txt

# 复制
wdfs cp /ffff/a.txt /ffff/a.bak.txt

# 生成分享链接
wdfs url /ffff/report.xlsx
# → http://14.18.111.222:18898/ffff/report.xlsx
import pymysql
import getpass

host = 'mysql-118817e7-webapp.l.aivencloud.com'
port = 21556
user = 'avnadmin'
database = 'defaultdb'

print("==================================================")
print("  CONG CU IMPORT DATABASE TU DONG CUA AI")
print("==================================================")
# Nhập password từ bàn phím an toàn
password = input("Hay copy/paste password tu web Aiven vao day \n(Ban se thay chuu hien thi ro rang de de kiem tra) -> Paste roi an Enter: ")

print("\n...Dang ket noi den Server Aiven...")
try:
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port,
        database=database,
        client_flag=pymysql.constants.CLIENT.MULTI_STATEMENTS,
        ssl={"ssl_mode": "REQUIRED"}
    )
    print("✅ Ket noi thanh cong! Dang doc file SQL...")
    with connection.cursor() as cursor:
        path = r"C:\laragon\www\SourceWebProgramming\database_web_linh_kien.sql"
        with open(path, 'r', encoding='utf-16') as f:
            sql = f.read()
            print("\n...Dang thuc thi file SQL (vui long doi vai giay)...")
            cursor.execute(sql)
            connection.commit()
    print("\n🎉 XUAT SAC! DA IMPORT TOAN BO DU LIEU THANH CONG!")
except Exception as e:
    print("\n❌ LỖI: ", e)
    print("Kiem tra lai xem ban da copy dung Mat khau chua nhe!")
finally:
    if 'connection' in locals() and connection.open:
        connection.close()

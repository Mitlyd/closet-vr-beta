import psycopg2

def get_connection():
    return psycopg2.connect(
        host="closetvr-closetvr-afa0.b.aivencloud.com",
        database="defaultdb",
        user="avnadmin",
        password="AVNS_-kUMceYUIIN95taY-Nv",
        port="25511"
    )
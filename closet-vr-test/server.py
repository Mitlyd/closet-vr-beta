from flask import Flask, jsonify, request
from db import get_connection
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# =============================================
# 1. CATÁLOGO DE PRENDAS
# =============================================
@app.route("/api/prendas", methods=["GET"])
def prendas():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id_prenda, nombre_prenda, descripcion, imagen FROM prendas")
        data = cur.fetchall()
        resultado = [{"id": r[0], "nombre": r[1], "descripcion": r[2], "imagen": r[3]} for r in data]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# =============================================
# 2. AUTENTICACIÓN
# =============================================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id_usuario, nombre FROM usuarios WHERE email=%s AND password=%s", (data["email"], data["password"]))
        user = cur.fetchone()
        if user:
            return jsonify({"status": "success", "id": user[0], "nombre": user[1]}), 200
        return jsonify({"status": "error", "message": "Credenciales incorrectas"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# =============================================
# 3. CARRITO (Añadir, Ver, Eliminar, Contar)
# =============================================
@app.route("/api/carrito", methods=["POST"])
def add_carrito():
    data = request.json
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO carrito (usuario_id, prenda_id, cantidad) VALUES (%s, %s, 1)", 
            (data["usuario_id"], data["prenda_id"])
        )
        conn.commit()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route("/api/ver-carrito/<int:usuario_id>", methods=["GET"])
def ver_carrito(usuario_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        query = """
            SELECT p.id_prenda, p.nombre_prenda, p.descripcion, p.imagen 
            FROM carrito c
            JOIN prendas p ON c.prenda_id = p.id_prenda
            WHERE c.usuario_id = %s
        """
        cur.execute(query, (usuario_id,))
        data = cur.fetchall()
        resultado = [{"id": r[0], "nombre": r[1], "descripcion": r[2], "imagen": r[3]} for r in data]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route("/api/carrito/eliminar", methods=["DELETE"])
def eliminar_carrito():
    data = request.json
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM carrito WHERE usuario_id = %s AND prenda_id = %s", 
            (data["usuario_id"], data["prenda_id"])
        )
        conn.commit()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route("/api/carrito/contar/<int:usuario_id>", methods=["GET"])
def contar_carrito(usuario_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM carrito WHERE usuario_id = %s", (usuario_id,))
        count = cur.fetchone()[0]
        return jsonify({"count": count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# =============================================
# 4. FAVORITOS (Añadir, Ver, Eliminar)
# =============================================
@app.route("/api/favoritos", methods=["POST"])
def add_favoritos():
    data = request.json
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO favoritos (id_usuario, id_prenda) VALUES (%s, %s)", 
            (data["usuario_id"], data["prenda_id"])
        )
        conn.commit()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route("/api/ver-favoritos/<int:usuario_id>", methods=["GET"])
def ver_favoritos(usuario_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        query = """
            SELECT p.id_prenda, p.nombre_prenda, p.descripcion, p.imagen 
            FROM favoritos f
            JOIN prendas p ON f.id_prenda = p.id_prenda
            WHERE f.id_usuario = %s
        """
        cur.execute(query, (usuario_id,))
        data = cur.fetchall()
        resultado = [{"id": r[0], "nombre": r[1], "descripcion": r[2], "imagen": r[3]} for r in data]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route("/api/favoritos/eliminar", methods=["DELETE"])
def eliminar_favoritos():
    data = request.json
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM favoritos WHERE id_usuario = %s AND id_prenda = %s", 
            (data["usuario_id"], data["prenda_id"])
        )
        conn.commit()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# --- ESTO SIEMPRE DEBE IR AL FINAL ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)
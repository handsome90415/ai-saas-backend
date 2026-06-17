import sqlite3
conn = sqlite3.connect('app.db')
try:
    conn.execute('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0')
    print('Added is_admin column')
except Exception as e:
    print(f'Column may already exist: {e}')
conn.execute("UPDATE users SET is_admin = 1 WHERE email = 'admin@test.com'")
conn.commit()
rows = conn.execute('SELECT email, is_admin FROM users').fetchall()
for r in rows:
    print(r)
conn.close()

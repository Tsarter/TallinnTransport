import psycopg2
import os


def execute_sql_script(script_path, db_config):
    # Read SQL script
    with open(script_path, "r") as file:
        sql_script = file.read()

    # Connect to PostgreSQL server
    conn = psycopg2.connect(
        dbname=db_config["POSTGRES_DB"],
        user=db_config["POSTGRES_USER"],
        password=db_config["POSTGRES_PASSWORD"],
        host=db_config["POSTGRES_HOST"],
        port=db_config["POSTGRES_PORT"],
    )
    cursor = conn.cursor()

    try:
        # Execute SQL script
        cursor.execute(sql_script)
        conn.commit()
        print("SQL script executed successfully")
    except Exception as e:
        conn.rollback()
        print(f"Error executing SQL script: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    script_path = os.path.join(os.path.dirname(__file__), "create_routes.sql")
    # Read database configuration from a file
    config_path = os.path.join(os.path.dirname(__file__), "..", "env.env")
    db_config = {}
    with open(config_path, "r") as config_file:
        for line in config_file:
            key, value = line.strip().split("=")
            db_config[key] = value
    execute_sql_script(script_path, db_config)

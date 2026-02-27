const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSQL() {
    const client = new Client({
        connectionString: "postgresql://postgres:jePsw6LCHm3xlcaH@db.mqqiyyxcoutbmuszwejz.supabase.co:5432/postgres",
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("Connected to Supabase Postgres.");

        const sqlPath = path.join(process.cwd(), 'docs', 'populate_agents.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Executing SQL script...");
        await client.query(sql);
        console.log("SQL script executed successfully!");

    } catch (err) {
        console.error("Error executing SQL:", err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runSQL();

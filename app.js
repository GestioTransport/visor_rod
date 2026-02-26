const express  = require('express');
const app      = express();
const cors     = require('cors');
const fetch    = require('node-fetch');
const path     = require('path');

app.use(cors());
app.use(express.static('public')); // sirve tu frontend

// --------------------------------------------------
// CACHE TIEMPO REAL TRENES
// --------------------------------------------------

let cacheTrenes = null;
let lastUpdate = null;

async function actualizarTrenes() {
    try {
        const response = await fetch("https://gtfsrt.renfe.com/vehicle_positions.json");

        if (response.ok) {
            cacheTrenes = await response.json();
            lastUpdate = new Date();
            console.log("🚆 Trenes actualizados:", lastUpdate.toLocaleTimeString());
        } else {
            console.error("Error Renfe:", response.status);
        }
    } catch (err) {
        console.error("Error actualizando trenes:", err);
    }
}

// Actualiza cada 20 segundos
setInterval(actualizarTrenes, 20000);
actualizarTrenes();

// --------------------------------------------------
// API TRENES
// --------------------------------------------------

app.get("/api/trenes", (req, res) => {
    if (cacheTrenes) {
        res.json({
            updated_at: lastUpdate,
            data: cacheTrenes
        });
    } else {
        res.status(503).json({
            error: "Datos aún no disponibles"
        });
    }
});

// --------------------------------------------------
// SERVIDOR (compatible con Render)
// --------------------------------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});

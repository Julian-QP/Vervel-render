require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" &&
          /^http:\/\/localhost:\d+$/.test(origin))
      ) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
  })
);
app.use(express.json());

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function serializeTask(task) {
  return {
    id: task._id.toString(),
    titulo: task.titulo,
    completada: task.completada,
  };
}

function getTaskId(id) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id
    ? new ObjectId(id)
    : null;
}

function createApp(tasks) {
  app.get(
    "/api/tareas",
    asyncHandler(async (_req, res) => {
      const allTasks = await tasks.find().sort({ _id: 1 }).toArray();
      res.json(allTasks.map(serializeTask));
    })
  );

  app.post(
    "/api/tareas",
    asyncHandler(async (req, res) => {
      const titulo =
        typeof req.body?.titulo === "string" ? req.body.titulo.trim() : "";
      if (!titulo) {
        return res.status(400).json({ error: "El titulo es obligatorio" });
      }

      const task = { titulo, completada: false };
      const result = await tasks.insertOne(task);
      res.status(201).json(serializeTask({ ...task, _id: result.insertedId }));
    })
  );

  app.put(
    "/api/tareas/:id",
    asyncHandler(async (req, res) => {
      const _id = getTaskId(req.params.id);
      if (!_id) return res.status(400).json({ error: "ID de tarea invalido" });

      const changes = {};
      if (Object.hasOwn(req.body ?? {}, "completada")) {
        if (typeof req.body.completada !== "boolean") {
          return res
            .status(400)
            .json({ error: "El estado completada debe ser booleano" });
        }
        changes.completada = req.body.completada;
      }
      if (Object.hasOwn(req.body ?? {}, "titulo")) {
        const titulo =
          typeof req.body.titulo === "string" ? req.body.titulo.trim() : "";
        if (!titulo) {
          return res.status(400).json({ error: "El titulo es obligatorio" });
        }
        changes.titulo = titulo;
      }
      if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: "No hay cambios para guardar" });
      }

      const task = await tasks.findOneAndUpdate(
        { _id },
        { $set: changes },
        { returnDocument: "after" }
      );
      if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
      res.json(serializeTask(task));
    })
  );

  app.delete(
    "/api/tareas/:id",
    asyncHandler(async (req, res) => {
      const _id = getTaskId(req.params.id);
      if (!_id) return res.status(400).json({ error: "ID de tarea invalido" });

      const result = await tasks.deleteOne({ _id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }
      res.status(204).send();
    })
  );

  app.use((err, _req, res, _next) => {
    console.error("Error en la API:", err);
    if (res.headersSent) return;
    res.status(500).json({ error: "Error interno del servidor" });
  });

  return app;
}

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Falta configurar la variable MONGODB_URI");

  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db(process.env.MONGODB_DB || "tareas_app");
  const tasks = database.collection("tareas");

  createApp(tasks);
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`API corriendo en el puerto ${port}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar la API:", error);
  process.exitCode = 1;
});

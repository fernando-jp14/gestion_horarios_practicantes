# 📘 Proyecto: **Gestión de Horarios de Practicantes**  

📌 **Descripción**  
El proyecto **Gestión de Horarios de Practicantes** es un sistema web desarrollado en **Django** que permite gestionar practicantes de manera eficiente.  
Ofrece funciones para registrar practicantes, asignar horarios, relacionar habilidades y visualizar la información en una interfaz clara.  
El objetivo es optimizar el control de asistencia y disponibilidad de los practicantes, mejorando la organización del equipo.  

---

## 🎯 **Objetivo del Proyecto**  
- Centralizar la información de los practicantes en una base de datos.  
- Permitir al coordinador gestionar horarios y habilidades desde un solo lugar.  
- Garantizar que los datos estén siempre actualizados y organizados.  
- Utilizar metodologías ágiles (Scrum) para el desarrollo en equipo.  

---

## 👨‍💻 **¿Qué se logró en el Sprint 1?**  
✅ Repositorio en GitHub con ramas **main**, **desarrollo** y **feature**.  
✅ CRUD de practicantes funcional (registro, edición y eliminación).  
✅ Módulo de gestión de horarios implementado con validaciones.  
✅ Organización del proyecto en Trello con HU, checklist y seguimiento.  
✅ Documentación inicial en este README.  

---

## 🛠 **Tecnologías Utilizadas**  

- 🌱 **Backend:** Python + Django  
- 🎨 **Frontend:** HTML5, CSS3, JS  
- ⚡ **Base de Datos:** SQLite (puede migrarse a MySQL/PostgreSQL)  
- 🎚 **Control de Versiones:** Git & GitHub  
- 👌 **Gestión del Proyecto:** Scrum con Trello  
- 🔗 **Conexiones:** API para integrar datos externos  

---

## 🧩 **Lenguajes Utilizados**  
- 🐍 Python  
- 🖌 HTML5 + CSS3  
- 🧠 JavaScript  
- 🗄 SQL (Django ORM)  

---

## 👥 **Roles del Equipo**  
✔ **Product Owner (PO):** Define objetivos y prioriza las historias de usuario.  
✔ **Scrum Master (SM):** Facilita el proceso ágil y el seguimiento en Trello.  
✔ **Frontend Developer:** Implementa vistas, formularios y estilos.  
✔ **Backend Developer:** Construye modelos, vistas y lógica de negocio.  
✔ **QA/Tester:** Realiza pruebas unitarias y de aceptación.  
✔ **Documentador:** Redacta HU, checklist y documentación del proyecto.  

---
## 📂 Estructura del Proyecto
📂 **gestion_horarios_practicantes/**  
 ┣ 📂 **Habilidades/**          # Módulo para gestionar habilidades de practicantes  
 ┣ 📂 **Horarios/**            # Módulo principal para gestionar los horarios  
 ┣ 📂 **Practicantes/**        # CRUD de practicantes  
 ┣ 📂 **templates/**           # Plantillas HTML  
 ┣ 📂 **static/**              # Archivos CSS y JS  
 ┣ 📄 **manage.py**            # Comando principal de Django  
 ┣ 📄 **requirements.txt**     # Dependencias del proyecto  
 ┗ 📄 **README.md**            # Documentación del proyecto  

---

## 📌 Historias de Usuario Implementadas (Sprint 1)

1️⃣ **HU01:** Creación del repositorio en GitHub.  
2️⃣ **HU02:** CRUD de practicantes.  
3️⃣ **HU03:** Asignación y visualización de horarios.  

---

## 🚀 Cómo Ejecutar el Proyecto

### 🔹 Requisitos Previos
- Tener **Python 3.10+** instalado.  
- Tener **pip** para instalar dependencias.  
- Tener **Git** para clonar el repositorio.  

---

🚀 Pasos para Ejecutar el Proyecto

1️⃣ Clonar este repositorio
git clone https://github.com/usuario/gestion-horarios-practicantes.git

2️⃣ Entrar a la carpeta del proyecto
cd gestion-horarios-practicantes

3️⃣ Instalar dependencias
pip install -r requirements.txt

4️⃣ Ejecutar migraciones
python manage.py migrate

5️⃣ Iniciar servidor de desarrollo
python manage.py runserver

6️⃣ Abrir en el navegador
http://127.0.0.1:8000

---

🧪 Cómo Probar el Sistema

✅ Registrar un nuevo practicante y verificar que aparece en el listado.
✅ Editar datos de un practicante y comprobar que los cambios se actualizan.
✅ Eliminar un practicante y confirmar que ya no está en la lista.
✅ Asignar horarios y verificar que no existan solapamientos.

---

📊 Sprint Review (Resumen del Sprint 1)

✅ Repositorio creado y configurado en GitHub.
✅ CRUD de practicantes implementado con validaciones.
✅ Asignación de horarios funcional.
✅ Documentación inicial lista.

---

📌 Próximos Pasos (Sprint 2)

🔹 Implementar gestión de habilidades asociadas a practicantes.
🔹 Agregar autenticación de usuarios (login/admin).
🔹 Mejorar diseño visual de la interfaz.
🔹 Agregar exportación de horarios (PDF/Excel).

---

📄 Licencia

Este proyecto es de uso académico y fue desarrollado por el Grupo 2 como parte de un trabajo colaborativo usando Scrum.

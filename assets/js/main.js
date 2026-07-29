/**
* DR-BIOS v2.0 - GRAPHIC ADVENTURE ENGINE
* Author: Daniel Rodríguez Barranco
* License: MIT
*/

(function () {
  "use strict";

  // Estado del motor de juego
  let initialLang = localStorage.getItem("lang") || "es";
  if (initialLang !== "es" && initialLang !== "en") {
    initialLang = "es";
  }
  const gameState = {
    lang: initialLang,
    activeZoom: null, // "hot-pc", "hot-movil", "hot-tpv", etc.
    activeDialogueProject: null,
    dialogueStep: "root",
    clickIndices: {}, // Registro de clicks secuenciales para cada hotspot
    activeBubble: false // Flag para rastrear si un bocadillo de diálogo flotante está activo
  };

  let hudText = null;

  // Sonidos
  function playSound(soundId) {
    const snd = document.getElementById(soundId);
    if (snd) {
      snd.currentTime = 0;
      snd.play().catch(() => {});
    }
  }

  // Configuración de zoom por hotspot (escala y traslación para centrar en 16:9)
  // Basado en el viewBox SVG (1024x576). El centro es (512, 288).
  const zoomSettings = {
    "hot-pc": { scale: 2.2, x: -33, y: 95 },
    "hot-movil": { scale: 3.5, x: -138, y: 2 },
    "hot-tpv": { scale: 2.2, x: -336, y: 22 },
    "hot-ideas": { scale: 2.3, x: 322, y: -208 },
    "hot-estanteria": { scale: 2.0, x: 432, y: -63 },
    "hot-pizarra": { scale: 2.1, x: 162, y: 127 },
    "hot-taza": { scale: 2.5, x: 374, y: -155 },
    "hot-arcade": { scale: 2.0, x: 330, y: 2 },
    "hot-mailreply": { scale: 2.2, x: 242, y: 13 }
  };

  // Frases de humor (Easter eggs) para clics normales (5 frases secuenciales por hotspot)
  const speechBubbleDB = {
    es: {
      "hot-taza": [
        "Nivel de cafeína: peligrosamente bajo.",
        "Está caliente. Al menos no se ha congelado todavía.",
        "Café frío, el mejor amigo del programador despistado.",
        "Ley de la termodinámica: el café se enfría a la velocidad a la que compila el código.",
        "Un sorbo más y podré hablar con las máquinas directamente."
      ],
      "hot-taza-mesa": [
        "Café de la tarde. Recién servido y humeante.",
        "La cafeína principal para aguantar la sesión de depuración.",
        "Si la taza está cerca del teclado, el riesgo de accidente se multiplica por dos.",
        "Café recién hecho. El verdadero combustible del backend.",
        "Temperatura óptima para picar código."
      ],
      "hot-ventana": [
        "Precioso atardecer en la costa. Se respira calma.",
        "Está atardeciendo. El clima ideal para picar código.",
        "Me encantan las vistas de Tenerife desde la ventana.",
        "¿Eso que se ve ahí fuera es 'la nube' de la que todo el mundo habla?",
        "Dicen que hay un mundo exterior ahí fuera, pero la resolución de mi pantalla es mejor."
      ],
      "hot-raspberry": [
        "Un prototipo de sistemas. Si toco este cable se cae todo.",
        "Parpadea un LED rojo. Probablemente no sea nada grave... espero.",
        "Administración de hardware real. Aquí empezó todo.",
        "¿Hueles eso? Es el dulce aroma de la potencia de cálculo a 80 grados.",
        "Cluster de un nodo. Técnicamente es Hadoop. Por las noches digiere datasets de Kaggle."
      ],
      "hot-puerta": [
        "Es mi archivo 'vida.log'. El bucle principal de mi rutina.",
        "'estudiar, trabajar, café, depurar, repetir...' Un bucle while infinito.",
        "El log indica que hoy he consumido más cafeína de lo recomendado por la CPU.",
        "Aquí registro mis hitos y lecciones como desarrollador autodidacta.",
        "vida.log: Sin errores graves detectados en el hilo de ejecución principal."
      ],
      "hot-poster": [
        "Un póster de Tenerife. La isla del Teide y el eterno verano.",
        "Me recuerda la caminata que me pegué para subir al Teide.",
        "Muy bonito Tenerife, sólo faltaría que pusieran buenas tapas como en mi tierra",
        "La montaña más alta de España (3718 m) junto al océano más grande del mundo. Un lugar para inspirarse.",
        "¿Sabías que el Teide es el tercer volcán más alto del mundo desde su base?"
      ],
      "hot-planta": [
        "Sorprendentemente sigue viva.",
        "Sí ahora la riego, espera que estoy haciendo un commit.",
        "Le programé un sensor de humedad, pero olvidé conectarlo a la base de datos.",
        "Se alimenta de luz artificial, café evaporado y quejas sobre JavaScript.",
        "Hojas verdes, código verde... todo compila en armonía."
      ],
      "hot-pizza": [
        "Object pizza = null;",
        "Error 404: Pizza no encontrada. Solo quedan los bordes.",
        "Variable local: pizza = null; depurando una cerveza...",
        "El combustible oficial del programador nocturno.",
        "La piña en la pizza es una excepción no controlada (RuntimeException)."
      ],
      "hot-c3po": [
        "Esta noche he quedado con Claude y Gemini para echarme unos tokens en Antigravity y contarles mis batallas de compilación.",
        "Fluido en más de seis millones de formas de comunicación, ¡y sigo sin entender este script!",
        "Las posibilidades de compilar este commit a la primera son de 3.720 contra una.",
        "R2-D2 insiste en que deberíamos usar Python, pero yo soy más de Java tradicional.",
        "¡Por todos los cielos!\n¡Un NullPointerException! ¡Estamos perdidos!"
      ],
      "hot-avion": [
        "Próximo viaje: Granada",
        "O quizá Donosti ?",
        "Y Córdoba ? ",
        "Puede que Málaga",        
        "Está en desarrollo, le falta combustible para salir a producción."         
      ],
      "hot-cajon": [
        "Cajones llenos de cables enredados, móviles viejos y cargadores de Nokia.",
        "¿Buscas un cable HDMI? Al fondo a la derecha, debajo de tres adaptadores VGA.",
        "Vete tú a saber qué hay aquí dentro... creo que acabo de tocar un euroconector de 1998.",
        "Ley de los cajones: si necesitas un cable específico, tendrás todos los existentes excepto ese.",
        "He encontrado un pendrive de 512 MB con un README.txt que dice 'IMPORTANTE - NO BORRAR'. Lo he borrado."
      ],
      "hot-tux": [
        "sudo su - root. Ya soy el amo del sistema.",
        "chmod 777 todo. El servidor de producción puede esperar.",
        "apt-get install cerveza. Paquete no encontrado. Compilando desde fuentes...",
        "En Kali Linux entro como root por defecto. Hay que vivir peligrosamente.",
        "Tux lleva desde 1991 guardando el kernel. Más leal que un golden retriever."
      ],
      "hot-rollo": [
        "Mi lema: si funciona... no lo toques.",
        "¡¡NO LO TOQUES!!",
        "Ala. Ya se ha roto. \n$ git pull origin main"
      ]
    },
    en: {
      "hot-taza": [
        "Caffeine level: dangerously low.",
        "It's hot. At least it hasn't frozen yet.",
        "Cold coffee: the distracted programmer's signature drink.",
        "Thermodynamics law: coffee cools down at the speed of compilation.",
        "One more sip and I'll be speaking directly to the machine."
      ],
      "hot-taza-mesa": [
        "Afternoon coffee. Freshly poured and steaming.",
        "Main caffeine supply to handle the debugging session.",
        "If the cup is near the keyboard, disaster risk doubles.",
        "Freshly brewed coffee. The true backend fuel.",
        "Optimal temperature for coding."
      ],
      "hot-ventana": [
        "Beautiful sunset on the coast. Pure peace.",
        "Sunset. The perfect time to code.",
        "I love the Tenerife views from the window.",
        "Is that cloud out there the 'cloud' everyone is talking about?",
        "They say there is a real world out there, but my screen resolution is better."
      ],
      "hot-raspberry": [
        "A systems prototype. If I touch this wire, everything crashes.",
        "A red LED is blinking. It's probably fine... hopefully.",
        "Real systems automation. This is where it all started.",
        "Do you smell that? The sweet scent of processing power running at 80°C.",
        "Single-node cluster. Technically it's Hadoop. Chews through Kaggle datasets at night."
      ],
      "hot-puerta": [
        "It's my 'life.log' file. My routine's main loop.",
        "'study, work, coffee, debug, repeat...' An infinite while loop.",
        "The log shows I consumed more caffeine today than recommended by the CPU.",
        "This is where I log my milestones and lessons as a self-taught developer.",
        "life.log: No fatal errors detected in the main execution thread."
      ],
      "hot-poster": [
        "Tenerife poster. The island of Mount Teide and eternal summer.",
        "Reminds me of the hike I did to climb to the top of Mount Teide.",
        "Tenerife is beautiful, but there are no olive trees to harvest like back in my hometown, Linares.",
        "Even though the poster is of the Canary Islands, my heart is split between Linares and Granada.",
        "Did you know Mount Teide is the third tallest volcanic structure in the world?"
      ],
      "hot-planta": [
        "Surprisingly, it's still alive.",
        "Yes, I'll water it now, wait, I'm making a commit.",
        "I programmed a soil moisture sensor, but forgot to hook it to the database.",
        "It feeds on artificial light, evaporated coffee, and JavaScript complaints.",
        "Green leaves, green code... everything compiles in harmony."
      ],
      "hot-pizza": [
        "Object pizza = null;",
        "Error 404: Pizza not found. Only crusts left.",
        "Local variable: pizza = null; debugging a beer...",
        "The official fuel of the midnight developer.",
        "Pineapple on pizza is an unhandled RuntimeException."
      ],
      "hot-c3po": [
        "Tonight I'm meeting Claude and Gemini for a few tokens on Antigravity to swap compilation war stories.",
        "Fluent in over six million forms of communication, and I still don't understand this script!",
        "The odds of compiling this commit on the first try are 3,720 to one!",
        "R2-D2 insists we should use Python, but I am more of a traditional Java droid.",
        "Oh my! A NullPointerException! We are doomed!"
      ],
      "hot-avion": [
        "Next destinations on my itinerary: Granada, San Sebastián, Málaga, Almería...",
        "I hope I can catch a Binter flight, at least they give you free food and a beer.",
        "This airplane runs on clean code, but it lacks fuel to launch to production.",
        "A toy biplane hanging from the ceiling. Sometimes it helps me clear my mind.",
        "Next direct flight heading towards my next professional challenge."
      ],
      "hot-cajon": [
        "Drawers full of tangled cables, old mobile phones, and ancient Nokia chargers.",
        "Looking for an HDMI cable? Way in the back on the right, under three VGA adapters.",
        "Who knows what's in here... I think I just touched a SCART cable from 1998.",
        "Law of drawers: if you need a specific cable, you will have every existing cable except that one.",
        "Found a 512 MB pendrive with a README.txt that says 'IMPORTANT - DO NOT DELETE'. I deleted it."
      ],
      "hot-tux": [
        "sudo su - root. I am now the master of the system.",
        "chmod 777 everything. Production server can wait.",
        "apt-get install beer. Package not found. Compiling from source...",
        "On Kali Linux I boot as root by default. Living dangerously.",
        "Tux has been guarding the kernel since 1991. More loyal than a golden retriever."
      ],
      "hot-rollo": [
        "My motto: if it works... don't touch it.",
        "DON'T TOUCH IT!!",
        "Great. Now it's broken. $ git pull origin main"
      ]
    }
  };

  // Árboles de conversación interactivos (Diálogos)
  const dialogueDB = {
    es: {
      timelink: {
        root: {
          speech: "Entorno local: SaaS de control horario 'TimeLink'. ¿Qué deseas inspeccionar?",
          choices: [
            { text: "1. ¿Qué problema resuelve este producto?", next: "problem" },
            { text: "2. Explícame la arquitectura técnica.", next: "architecture" },
            { text: "3. Formato de respuesta JSON de la API.", next: "api" },
            { text: "4. [Abrir demostración en producción]", action: "link", url: "https://timelink-bootstrap.onrender.com" },
            { text: "5. Cambiar a otro proyecto de software.", next: "switch_proj" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        problem: {
          speech: "TimeLink resuelve el control de jornada para pymes. Permite registros legales simplificados y móviles para operarios externos, automatizando cobros con Stripe sin gestiones manuales.",
          choices: [
            { text: "[ <- Volver al ordenador ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Desarrollado en Laravel (PHP) con Bootstrap/JS. Desplegado mediante contenedores Docker aislados en Render.com (Apache, MySQL, PHP-FPM) para garantizar consistencia lógica.",
          choices: [
            { text: "[ <- Volver al ordenador ]", next: "root" }
          ]
        },
        api: {
          speech: "Expone endpoints internos asíncronos para fichajes en AJAX. Respuesta JSON típica al registrar fichaje:\n{\n  'status': 'success',\n  'message': 'Fichaje registrado',\n  'data': { 'user_id': 42, 'check_in': '2026-07-18 16:15:00' }\n}",
          choices: [
            { text: "[ <- Volver al ordenador ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Selecciona el proyecto que deseas auditar en la terminal:",
          choices: [
            { text: "[ Auditar TimeLink SaaS ]", next: "root" },
            { text: "[ Auditar GoToPádel App ]", action: "switch", project: "gotopadel" },
            { text: "[ Auditar OKBackups Systems ]", action: "switch", project: "okbackups" },
            { text: "[ Auditar MailReply AI ]", action: "switch", project: "mailreply" }
          ]
        }
      },
      gotopadel: {
        root: {
          speech: "Smartphone: Ecosistema 'GoToPádel'. ¿Qué módulo quieres diagnosticar?",
          choices: [
            { text: "1. ¿Qué problema resuelve esta app?", next: "problem" },
            { text: "2. ¿Cómo funciona la sincronización cliente-servidor?", next: "architecture" },
            { text: "3. Háblame de las transacciones concurrentes.", next: "database" },
            { text: "4. [Abrir portal web de la plataforma]", action: "link", url: "https://padel.drbarranco.es/" },
            { text: "5. Cambiar a otro proyecto de software.", next: "switch_proj" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        problem: {
          speech: "Permite organizar partidos de pádel y reservar pistas. El reto era conectar jugadores en tiempo real evitando solapamientos de reservas ni exceder los 4 jugadores por partido.",
          choices: [
            { text: "[ <- Volver al móvil ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Ecosistema híbrido. Servidor Spring Boot (Java) con JPA/Hibernate expuesto mediante REST API JWT. App móvil nativa Android en Java con SQLite y Google Maps API.",
          choices: [
            { text: "[ <- Volver al móvil ]", next: "root" }
          ]
        },
        database: {
          speech: "Para evitar condiciones de carrera cuando varios jugadores se inscribían al mismo cupo, apliqué bloqueos de escritura pesimistas en Spring Boot (PESSIMISTIC_WRITE) asegurando transacciones ACID atómicas.",
          choices: [
            { text: "[ <- Volver al móvil ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Selecciona el proyecto que deseas auditar en la terminal:",
          choices: [
            { text: "[ Auditar TimeLink SaaS ]", action: "switch", project: "timelink" },
            { text: "[ Auditar GoToPádel App ]", next: "root" },
            { text: "[ Auditar OKBackups Systems ]", action: "switch", project: "okbackups" },
            { text: "[ Auditar MailReply AI ]", action: "switch", project: "mailreply" }
          ]
        }
      },
      okbackups: {
        root: {
          speech: "TPV antiguo. Utilidad de sistemas 'OKBackups' cargada. ¿Qué deseas auditar?",
          choices: [
            { text: "1. ¿Qué problema resuelve este agente?", next: "problem" },
            { text: "2. Explícame la arquitectura y empaquetado.", next: "architecture" },
            { text: "3. ¿Cuáles fueron los mayores desafíos de red?", next: "challenges" },
            { text: "4. [Acceder al repositorio de código]", next: "private_repo" },
            { text: "5. Cambiar a otro proyecto de software.", next: "switch_proj" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        problem: {
          speech: "Los comercios a menudo pierden sus bases de datos locales (Firebird, MySQL) por cortes de luz. OKBackups automatiza la extracción, compresión y subida desasistida a Firebase Storage.",
          choices: [
            { text: "[ <- Volver al TPV ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Agente de bajo nivel desarrollado en Python, empaquetado a ejecutable Windows independiente (.exe) usando PyInstaller, corriendo como Windows Service nativo. Dashboard Flask.",
          choices: [
            { text: "[ <- Volver al TPV ]", next: "root" }
          ]
        },
        challenges: {
          speech: "Soportar cortes de red en subidas de archivos pesados. Diseñé un algoritmo de reintentos exponencial con Backoff y fragmentación para reanudar subidas fallidas.",
          choices: [
            { text: "[ <- Volver al TPV ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Selecciona el proyecto que deseas auditar en la terminal:",
          choices: [
            { text: "[ Auditar TimeLink SaaS ]", action: "switch", project: "timelink" },
            { text: "[ Auditar GoToPádel App ]", action: "switch", project: "gotopadel" },
            { text: "[ Auditar OKBackups Systems ]", next: "root" },
            { text: "[ Auditar MailReply AI ]", action: "switch", project: "mailreply" }
          ]
        },
        private_repo: {
          speech: "🔒 Este repositorio es privado. La aplicación está en producción para mi empresa actual. Si quieres saber más del proyecto, ¡escríbeme!",
          choices: [
            { text: "[ ✉ Contactar con Daniel ]", action: "switch", project: "hablemos" },
            { text: "[ <- Volver al TPV ]", next: "root" }
          ]
        }
      },
      curriculum: {
        root: {
          speech: "Dossier y Currículum de Daniel Rodríguez. ¿Qué versión deseas descargar?",
          choices: [
            { text: "[ 📁 Descargar Currículum (Español) ]", action: "download", file: "es" },
            { text: "[ 📁 Download Resume (English) ]", action: "download", file: "en" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        }
      },
      estanteria: {
        root: {
          speech: "Archivador de tecnologías del stack técnico de Daniel. Selecciona un bloque:",
          choices: [
            { text: "1. Tecnologías Backend (Java, PHP, Laravel, Spring Boot)", next: "backend" },
            { text: "2. Bases de Datos & DevOps (MySQL, PostgreSQL, Docker)", next: "databases" },
            { text: "3. Desarrollo Móvil & Scripts (Android Studio, Python)", next: "mobile" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        backend: {
          speech: "Especialista en la construcción de APIs RESTful robustas y arquitecturas modulares en Java (Spring Boot) y PHP (Laravel / MVC).",
          choices: [
            { text: "[ <- Volver al archivador ]", next: "root" }
          ]
        },
        databases: {
          speech: "Modelado relacional y optimización en MySQL, PostgreSQL, SQLite y Firebird. Administración de entornos Dockerizados.",
          choices: [
            { text: "[ <- Volver al archivador ]", next: "root" }
          ]
        },
        mobile: {
          speech: "Creación de aplicaciones Android nativas seguras e interconectadas. Desarrollo de scripts de automatización e integración con Python.",
          choices: [
            { text: "[ <- Volver al archivador ]", next: "root" }
          ]
        }
      },
      pizarra: {
        root: {
          speech: "Pizarra de Tareas y Formación de Daniel. Historial formativo:",
          choices: [
            { text: "1. Ciclo Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)", next: "dam" },
            { text: "2. Ciclo Técnico Superior en Desarrollo de Aplicaciones Web (DAW)", next: "daw" },
            { text: "3. Curso de Especialización en Inteligencia Artificial y Big Data (Máster de FP)", next: "ia" },
            { text: "4. Inglés y certificaciones oficiales adicionales", next: "certs" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        dam: {
          speech: "Técnico Superior en DAM (2020-2022). Especialidad en programación de sistemas, interfaces nativas de Android, Java, bases de datos relacionales y optimización de código.",
          choices: [
            { text: "[ <- Volver a la pizarra ]", next: "root" }
          ]
        },
        daw: {
          speech: "Técnico Superior en DAW (2022-2023). Especialidad en diseño y desarrollo de aplicaciones del lado del servidor (PHP/Laravel/Spring) y cliente (HTML/JS/Bootstrap/Tailwind).",
          choices: [
            { text: "[ <- Volver a la pizarra ]", next: "root" }
          ]
        },
        ia: {
          speech: "Curso de Especialización (Máster de FP) en Inteligencia Artificial y Big Data (Octubre 2025 - Abril 2026). Especialidad en modelos de Machine Learning y Deep Learning, analítica de datos a gran escala, Python y librerías científicas.",
          choices: [
            { text: "[ <- Volver a la pizarra ]", next: "root" }
          ]
        },
        certs: {
          speech: "Nivel B2 de Inglés (Acreditación 'English for IT' de EF). Certificaciones adicionales en SQL de bases de datos avanzadas, desarrollo PHP y metodologías ágiles.",
          choices: [
            { text: "[ <- Volver a la pizarra ]", next: "root" }
          ]
        }
      },
      hablemos: {
        root: {
          speech: "Contacto y canales directos con Daniel. ¿Qué medio prefieres?",
          choices: [
            { text: "📧 Enviar correo electrónico (drbarrancodev@gmail.com)", action: "link", url: "mailto:drbarrancodev@gmail.com" },
            { text: "🔗 Visitar perfil de LinkedIn", action: "link", url: "https://www.linkedin.com/in/drbarranco/" },
            { text: "🐙 Examinar código en GitHub", action: "link", url: "https://github.com/drbarranco" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        }
      },
      experiencia: {
        root: {
          speech: "Trayectoria laboral de Daniel. Selecciona un período:",
          choices: [
            { text: "1. Soporte IT y Mantenimiento de Hardware (TPVs)", next: "hardware" },
            { text: "2. Desarrollo de Aplicaciones en Prácticas (Sistemas)", next: "practices" },
            { text: "3. Desarrollo SaaS y Soluciones de Software Libre", next: "saas" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        hardware: {
          speech: "Años trabajando en soporte técnico informático de hardware y servidores locales. Diagnóstico y mantenimiento de TPVs, cableado e infraestructura de comercios y hostelería.",
          choices: [
            { text: "[ <- Volver a la experiencia ]", next: "root" }
          ]
        },
        practices: {
          speech: "Desarrollo de módulos e interconexiones de bases de datos locales con la nube, automatizaciones de scripts bash/python y control de flujos informáticos.",
          choices: [
            { text: "[ <- Volver a la experiencia ]", next: "root" }
          ]
        },
        saas: {
          speech: "Diseño, implementación y puesta en marcha de aplicaciones de control horario (TimeLink) y gestión de pistas deportivas (GoToPádel) para clientes autónomos reales.",
          choices: [
            { text: "[ <- Volver a la experiencia ]", next: "root" }
          ]
        }
      },
      arcade: {
        root: {
          speech: "Estás ante la recreativa retro 'BUG HUNTER'. ¿Qué deseas hacer?",
          choices: [
            { text: "1. Insertar moneda para debuguear código.", next: "insert" },
            { text: "2. Ver tabla de records históricos.", next: "records" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        insert: {
          speech: "¡Moneda aceptada! Tu código tiene ahora un 10% menos de bugs fatales. Sigue explorando.",
          choices: [
            { text: "[ <- Volver a la recreativa ]", next: "root" }
          ]
        },
        records: {
          speech: "HISTORIC RECORDS:\n1. DANIEL - 999,999 pts\n2. DANIEL - 888,880 pts\n3. DANIEL - 777,770 pts",
          choices: [
            { text: "[ <- Volver a la recreativa ]", next: "root" }
          ]
        }
      },

      mailreply: {
        root: {
          speech: "Microservicio: 'MailReply AI' (Spring Boot 3 + ChatGPT API + Gmail OAuth2). ¿Qué deseas explorar?",
          choices: [
            { text: "1. ¿Qué problema resuelve este microservicio?", next: "problem" },
            { text: "2. Explícame la arquitectura técnica y la integración con Gmail OAuth2.", next: "architecture" },
            { text: "3. ¿Cómo funciona la generación de respuestas con IA (ChatGPT API)?", next: "ai" },
            { text: "4. [Acceder al repositorio de código]", next: "private_repo" },
            { text: "5. Cambiar a otro proyecto de software.", next: "switch_proj" },
            { text: "[ ← Volver al despacho ]", action: "exit" }
          ]
        },
        problem: {
          speech: "MailReply automatiza la respuesta a correos electrónicos repetitivos de clientes y soporte. Lee buzones en tiempo real mediante la API de Gmail, aplica reglas de remitentes autorizados y responde usando IA sin intervención humana.",
          choices: [
            { text: "[ <- Volver a MailReply ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Construido en Java 21 con Spring Boot 3.5 y Spring Data JPA sobre PostgreSQL. Autenticación OAuth2 con la API de Google Gmail v1, procesado en segundo plano con tareas programadas (@Scheduled) y panel de control en React 19 + TailwindCSS.",
          choices: [
            { text: "[ <- Volver a MailReply ]", next: "root" }
          ]
        },
        ai: {
          speech: "Extrae el cuerpo y remitente del correo no leído, verifica que esté en la lista blanca de remitentes (allowedSenders) y envía el contexto a la API de ChatGPT para generar una respuesta personalizada y profesional antes de marcar el correo como leído.",
          choices: [
            { text: "[ <- Volver a MailReply ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Selecciona el proyecto que deseas auditar en la terminal:",
          choices: [
            { text: "[ Auditar TimeLink SaaS ]", action: "switch", project: "timelink" },
            { text: "[ Auditar GoToPádel App ]", action: "switch", project: "gotopadel" },
            { text: "[ Auditar OKBackups Systems ]", action: "switch", project: "okbackups" },
            { text: "[ Auditar MailReply AI ]", next: "root" }
          ]
        },
        private_repo: {
          speech: "🔒 Este repositorio es privado. El proyecto está en desarrollo activo y aún no está disponible públicamente. Si quieres saber más, ¡escríbeme!",
          choices: [
            { text: "[ ✉ Contactar con Daniel ]", action: "switch", project: "hablemos" },
            { text: "[ <- Volver a MailReply ]", next: "root" }
          ]
        }
      }
    },
    en: {
      timelink: {
        root: {
          speech: "Local environment: TimeLink time-tracking SaaS. What do you want to inspect?",
          choices: [
            { text: "1. What problem does this product solve?", next: "problem" },
            { text: "2. Tell me about the technical architecture.", next: "architecture" },
            { text: "3. JSON API response format.", next: "api" },
            { text: "4. [Open production live demo]", action: "link", url: "https://timelink-bootstrap.onrender.com" },
            { text: "5. Switch to another software project.", next: "switch_proj" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        problem: {
          speech: "TimeLink automates employee clock-ins for SMEs. It provides legally compliant mobile tracking for remote workforces, automating card billing with Stripe without manual interactions.",
          choices: [
            { text: "[ <- Back to computer ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Developed in Laravel (PHP) with Bootstrap/JS. Deployed via Docker containers on Render.com (Apache, MySQL, PHP-FPM) to secure development environments.",
          choices: [
            { text: "[ <- Back to computer ]", next: "root" }
          ]
        },
        api: {
          speech: "Exposes internal async endpoints for quick AJAX clock-ins. Typical JSON response when checking in:\n{\n  'status': 'success',\n  'message': 'Check-in logged',\n  'data': { 'user_id': 42, 'check_in': '2026-07-18 16:15:00' }\n}",
          choices: [
            { text: "[ <- Back to computer ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Select the software project you want to audit in the terminal:",
          choices: [
            { text: "[ Audit TimeLink SaaS ]", next: "root" },
            { text: "[ Audit GoToPádel App ]", action: "switch", project: "gotopadel" },
            { text: "[ Audit OKBackups Systems ]", action: "switch", project: "okbackups" },
            { text: "[ Audit MailReply AI ]", action: "switch", project: "mailreply" }
          ]
        }
      },
      gotopadel: {
        root: {
          speech: "Smartphone: 'GoToPádel' platform emulator. Which module do you want to diagnose?",
          choices: [
            { text: "1. What problem does this app solve?", next: "problem" },
            { text: "2. How does client-server syncing work?", next: "architecture" },
            { text: "3. Tell me about database transactions.", next: "database" },
            { text: "4. [Open platform web portal]", action: "link", url: "https://padel.drbarranco.es/" },
            { text: "5. Switch to another software project.", next: "switch_proj" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        problem: {
          speech: "Enables padel match organization and court bookings. The challenge was connecting players in real-time without booking overlaps or exceeding 4 concurrent players per match.",
          choices: [
            { text: "[ <- Back to mobile ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Hybrid ecosystem. Spring Boot (Java) backend with JPA/Hibernate exposed via JWT REST APIs. Native Android client written in Java with SQLite database and Google Maps API.",
          choices: [
            { text: "[ <- Back to mobile ]", next: "root" }
          ]
        },
        database: {
          speech: "To prevent race conditions when multiple players joined the final match slot at the same time, I implemented pessimistic write locks (PESSIMISTIC_WRITE) in Spring Boot, securing atomic ACID transactions.",
          choices: [
            { text: "[ <- Back to mobile ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Select the software project you want to audit in the terminal:",
          choices: [
            { text: "[ Audit TimeLink SaaS ]", action: "switch", project: "timelink" },
            { text: "[ Audit GoToPádel App ]", next: "root" },
            { text: "[ Audit OKBackups Systems ]", action: "switch", project: "okbackups" },
            { text: "[ Audit MailReply AI ]", action: "switch", project: "mailreply" }
          ]
        }
      },
      okbackups: {
        root: {
          speech: "Old POS terminal. 'OKBackups' systems utility running. What do you want to audit?",
          choices: [
            { text: "1. What problem does this agent solve?", next: "problem" },
            { text: "2. Tell me about the architecture and packaging.", next: "architecture" },
            { text: "3. What were the main network challenges?", next: "challenges" },
            { text: "4. [Access source code repository]", next: "private_repo" },
            { text: "5. Switch to another software project.", next: "switch_proj" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        problem: {
          speech: "Local shops lose POS databases due to hardware failures or power cuts. OKBackups automates background extraction, compression, and secure uploads to Firebase Storage.",
          choices: [
            { text: "[ <- Back to POS ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Low-level system agent written in Python, compiled to a standalone Windows executable (.exe) using PyInstaller, running as a native Windows Service. Flask monitor dashboard.",
          choices: [
            { text: "[ <- Back to POS ]", next: "root" }
          ]
        },
        challenges: {
          speech: "Supporting network dropouts during large file uploads. I designed an exponential backoff retry algorithm with file chunking to safely resume interrupted uploads.",
          choices: [
            { text: "[ <- Back to POS ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Select the software project you want to audit in the terminal:",
          choices: [
            { text: "[ Audit TimeLink SaaS ]", action: "switch", project: "timelink" },
            { text: "[ Audit GoToPádel App ]", action: "switch", project: "gotopadel" },
            { text: "[ Audit OKBackups Systems ]", next: "root" },
            { text: "[ Audit MailReply AI ]", action: "switch", project: "mailreply" }
          ]
        },
        private_repo: {
          speech: "🔒 This repository is private. The app is deployed in production for my current employer. If you want to know more about the project, feel free to reach out!",
          choices: [
            { text: "[ ✉ Contact Daniel ]", action: "switch", project: "hablemos" },
            { text: "[ <- Back to POS ]", next: "root" }
          ]
        }
      },
      curriculum: {
        root: {
          speech: "Daniel Rodríguez's Dossier. Which version would you like to download?",
          choices: [
            { text: "[ 📁 Download CV (Spanish) ]", action: "download", file: "es" },
            { text: "[ 📁 Download Resume (English) ]", action: "download", file: "en" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        }
      },
      estanteria: {
        root: {
          speech: "Daniel's stack files shelf. Select a technology stack:",
          choices: [
            { text: "1. Backend tech (Java, PHP, Laravel, Spring Boot)", next: "backend" },
            { text: "2. Databases & DevOps (MySQL, PostgreSQL, Docker)", next: "databases" },
            { text: "3. Mobile & Systems scripting (Android, Python)", next: "mobile" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        backend: {
          speech: "Specialist in building robust RESTful APIs and modular MVC architectures using Java (Spring Boot) and PHP (Laravel).",
          choices: [
            { text: "[ <- Back to file ]", next: "root" }
          ]
        },
        databases: {
          speech: "Relational design and performance tuning in MySQL, PostgreSQL, SQLite, and Firebird. Dockerized environments.",
          choices: [
            { text: "[ <- Back to file ]", next: "root" }
          ]
        },
        mobile: {
          speech: "Developing native Android apps. Automation scripting and OS integrations using Python.",
          choices: [
            { text: "[ <- Back to file ]", next: "root" }
          ]
        }
      },
      pizarra: {
        root: {
          speech: "Daniel's Task Board & Education history:",
          choices: [
            { text: "1. Higher Technical Degree in Multiplatform Application Development (DAM)", next: "dam" },
            { text: "2. Higher Technical Degree in Web Application Development (DAW)", next: "daw" },
            { text: "3. FP Specialization Course in Artificial Intelligence and Big Data (Master's level)", next: "ia" },
            { text: "4. English and additional official certifications", next: "certs" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        dam: {
          speech: "Higher Degree in DAM (2020-2022). Specialization in system programming, Android native UI development, Java, database engines, and performance optimizations.",
          choices: [
            { text: "[ <- Back to whiteboard ]", next: "root" }
          ]
        },
        daw: {
          speech: "Higher Degree in DAW (2022-2023). Specialization in server-side technologies (PHP/Laravel/Spring) and client-side (HTML/JS/Bootstrap/Tailwind).",
          choices: [
            { text: "[ <- Back to whiteboard ]", next: "root" }
          ]
        },
        ia: {
          speech: "Specialization Course (FP Master's) in Artificial Intelligence and Big Data (October 2025 - April 2026). Specializing in Machine Learning and Deep Learning models, large-scale data analytics, Python, and scientific libraries.",
          choices: [
            { text: "[ <- Back to whiteboard ]", next: "root" }
          ]
        },
        certs: {
          speech: "EF English B2 level ('English for IT' certification). Additional credentials in advanced databases, SQL, PHP web development, and agile practices.",
          choices: [
            { text: "[ <- Back to whiteboard ]", next: "root" }
          ]
        }
      },
      hablemos: {
        root: {
          speech: "Get in touch with Daniel Rodríguez. Which channel do you prefer?",
          choices: [
            { text: "📧 Send email (drbarrancodev@gmail.com)", action: "link", url: "mailto:drbarrancodev@gmail.com" },
            { text: "🔗 Visit LinkedIn profile", action: "link", url: "https://www.linkedin.com/in/drbarranco/" },
            { text: "🐙 Browse source code on GitHub", action: "link", url: "https://github.com/drbarranco" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        }
      },
      experiencia: {
        root: {
          speech: "Daniel's professional timeline. Select a period:",
          choices: [
            { text: "1. IT Support & Hardware Maintenance (POS/TPVs)", next: "hardware" },
            { text: "2. Systems Application Development Internship", next: "practices" },
            { text: "3. SaaS Development & Open-Source Solutions", next: "saas" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        hardware: {
          speech: "Years working on local system setups and computer hardware support. Diagnostic and maintenance of POS hardware, network structures, and systems in shops and restaurants.",
          choices: [
            { text: "[ <- Back to experience ]", next: "root" }
          ]
        },
        practices: {
          speech: "Developing local SQL database connectors to cloud storage, bash/python script automations, and workflow optimizations.",
          choices: [
            { text: "[ <- Back to experience ]", next: "root" }
          ]
        },
        saas: {
          speech: "Design, deployment, and operation of TimeLink (time-tracking app) and GoToPádel (court booking ecosystem) for real local clients.",
          choices: [
            { text: "[ <- Back to experience ]", next: "root" }
          ]
        }
      },
      arcade: {
        root: {
          speech: "You are playing the retro 'BUG HUNTER' arcade cabinet. What do you want to do?",
          choices: [
            { text: "1. Insert coin to debug code.", next: "insert" },
            { text: "2. View local high scores.", next: "records" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        insert: {
          speech: "Coin accepted! Your active project codebase has now 10% fewer fatal bugs. Keep playing.",
          choices: [
            { text: "[ <- Back to cabinet ]", next: "root" }
          ]
        },
        records: {
          speech: "HIGH SCORES:\n1. DANIEL - 999,999 pts\n2. DANIEL - 888,880 pts\n3. DANIEL - 777,770 pts",
          choices: [
            { text: "[ <- Back to cabinet ]", next: "root" }
          ]
        }
      },

      mailreply: {
        root: {
          speech: "Microservice: 'MailReply AI' (Spring Boot 3 + ChatGPT API + Gmail OAuth2). What do you want to explore?",
          choices: [
            { text: "1. What problem does this microservice solve?", next: "problem" },
            { text: "2. Tell me about the technical architecture & Gmail OAuth2 integration.", next: "architecture" },
            { text: "3. How does AI response generation work (ChatGPT API)?", next: "ai" },
            { text: "4. [Access source code repository]", next: "private_repo" },
            { text: "5. Switch to another software project.", next: "switch_proj" },
            { text: "[ ← Back to room ]", action: "exit" }
          ]
        },
        problem: {
          speech: "MailReply automates responses to repetitive customer support and inquiry emails. It reads inboxes in real time via Gmail API, applies whitelisting rules, and generates AI responses without human intervention.",
          choices: [
            { text: "[ <- Back to MailReply ]", next: "root" }
          ]
        },
        architecture: {
          speech: "Built in Java 21 with Spring Boot 3.5 and Spring Data JPA on PostgreSQL. OAuth2 authentication with Google Gmail API v1, scheduled background execution (@Scheduled), and React 19 + TailwindCSS management dashboard.",
          choices: [
            { text: "[ <- Back to MailReply ]", next: "root" }
          ]
        },
        ai: {
          speech: "Extracts body and sender of unread emails, verifies allowedSenders whitelist, and sends context to ChatGPT API to generate a personalized professional response before marking the email as read.",
          choices: [
            { text: "[ <- Back to MailReply ]", next: "root" }
          ]
        },
        switch_proj: {
          speech: "Select the software project you want to audit in the terminal:",
          choices: [
            { text: "[ Audit TimeLink SaaS ]", action: "switch", project: "timelink" },
            { text: "[ Audit GoToPádel App ]", action: "switch", project: "gotopadel" },
            { text: "[ Audit OKBackups Systems ]", action: "switch", project: "okbackups" },
            { text: "[ Audit MailReply AI ]", next: "root" }
          ]
        },
        private_repo: {
          speech: "🔒 This repository is private. The project is in active development and not yet publicly available. If you'd like to know more, feel free to reach out!",
          choices: [
            { text: "[ ✉ Contact Daniel ]", action: "switch", project: "hablemos" },
            { text: "[ <- Back to MailReply ]", next: "root" }
          ]
        }
      }
    }
  };

  // ===========================================================================
  // PARALLAX DEL RATÓN (DESHABILITADO POR DEFECTO A PETICIÓN)
  // ===========================================================================
  function initParallax() {}

  // ===========================================================================
  // SISTEMA DE ZOOM & ENFOQUE
  // ===========================================================================

  function applyZoom(hotspotId) {
    const roomWrapper = document.getElementById("room-wrapper");
    const gameViewport = document.getElementById("game-viewport");
    const btnZoomOut = document.getElementById("btn-zoom-out");

    if (!roomWrapper || !btnZoomOut || !gameViewport) return;

    const config = zoomSettings[hotspotId];
    if (!config) return;

    gameState.activeZoom = hotspotId;
    playSound("snd-zoom");

    // Aplicar transformación y añadir clase zoomed-in para atenuar menús HTML
    roomWrapper.style.transform = `scale(${config.scale}) translate(${config.x}px, ${config.y}px)`;
    gameViewport.classList.add("zoomed-in");
    
    // Ocultar HUD general
    document.getElementById("hud-action-text").textContent = "";

    // Mostrar botón de volver
    btnZoomOut.classList.add("active");

    // Cargar diálogo interactivo correspondiente
    const projectKeys = {
      "hot-pc": "timelink",
      "hot-movil": "gotopadel",
      "hot-tpv": "okbackups",
      "hot-estanteria": "estanteria",
      "hot-pizarra": "pizarra",
      "hot-taza": "hablemos",
      "hot-ideas": "curriculum",
      "hot-arcade": "arcade",
      "hot-mailreply": "mailreply"
    };

    const projKey = projectKeys[hotspotId];
    if (projKey) {
      setTimeout(() => {
        openDialoguePanel(projKey);
      }, 500);
    }
  }

  function resetZoom() {
    const roomWrapper = document.getElementById("room-wrapper");
    const gameViewport = document.getElementById("game-viewport");
    const btnZoomOut = document.getElementById("btn-zoom-out");

    if (!roomWrapper || !btnZoomOut || !gameViewport) return;

    gameState.activeZoom = null;
    gameState.activeDialogueProject = null;
    gameState.dialogueStep = "root";

    playSound("snd-zoom");
    roomWrapper.style.transform = "scale(1) translate(0, 0)";
    gameViewport.classList.remove("zoomed-in");
    btnZoomOut.classList.remove("active");
    closeDialoguePanel();
  }

  // ===========================================================================
  // ÁRBOL DE DIÁLOGOS
  // ===========================================================================

  const diagPanel = document.getElementById("dialogue-panel");
  const diagSpeaker = document.getElementById("dialogue-speaker");
  const diagSpeech = document.getElementById("dialogue-speech-text");
  const diagChoices = document.getElementById("dialogue-choices-list");

  function openDialoguePanel(projKey) {
    if (!diagPanel) return;
    gameState.activeDialogueProject = projKey;
    gameState.dialogueStep = "root";

    const speakers = {
      timelink: "SYSTEM_STATUS_TIMELINK //",
      gotopadel: "SYSTEM_STATUS_GOTOPADEL //",
      okbackups: "SYSTEM_STATUS_OKBACKUPS //",
      curriculum: "CV_DOSSIER //",
      estanteria: "TECH_STACK //",
      pizarra: "EDUCATION_BOARD //",
      hablemos: "CONTACT_INTERFACE //",
      experiencia: "WORK_HISTORY //",
      arcade: "BUG_HUNTER_CABINET //",
      mailreply: "SYSTEM_STATUS_MAILREPLY //"
    };

    diagSpeaker.textContent = speakers[projKey] || "LOG //";
    diagPanel.classList.add("active");
    renderDialogueStep();
  }

  function closeDialoguePanel() {
    if (diagPanel) diagPanel.classList.remove("active");
  }

  function renderDialogueStep() {
    const proj = gameState.activeDialogueProject;
    const step = gameState.dialogueStep;
    const lang = gameState.lang;

    const data = dialogueDB[lang][proj] && dialogueDB[lang][proj][step];
    if (!data) return;

    // Limpiar opciones inmediatamente para evitar saltos y superposiciones de texto
    if (diagChoices) diagChoices.innerHTML = "";

    diagSpeech.textContent = "";
    let i = 0;
    const text = data.speech;

    if (window.typewriterInterval) clearInterval(window.typewriterInterval);

    window.typewriterInterval = setInterval(() => {
      diagSpeech.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(window.typewriterInterval);
        renderChoices(data.choices);
      }
    }, 12);
  }

  function renderChoices(choices) {
    if (!diagChoices) return;
    diagChoices.innerHTML = "";

    choices.forEach((choice) => {
      const li = document.createElement("li");
      li.textContent = choice.text;
      
      li.addEventListener("click", () => {
        if (choice.action === "exit") {
          resetZoom();
        } else if (choice.action === "link") {
          playSound("snd-success");
          window.open(choice.url, "_blank");
        } else if (choice.action === "download") {
          downloadCV(choice.file === "en");
        } else if (choice.action === "switch") {
          // Salto directo de proyecto a otro en la terminal
          openDialoguePanel(choice.project);
        } else {
          gameState.dialogueStep = choice.next;
          renderDialogueStep();
        }
      });
      
      diagChoices.appendChild(li);
    });
  }

  // ===========================================================================
  // GLOBOS DE DIÁLOGO FLOTANTES (INTERACCIONES SECUNDARIAS)
  // ===========================================================================

  const speechBubble = document.getElementById("speech-bubble");

  function triggerSpeechBubble(hotspotId, clientX, clientY) {
    if (!speechBubble) return;

    const lang = gameState.lang;
    const list = speechBubbleDB[lang][hotspotId];
    if (!list) return;

    if (!gameState.clickIndices) {
      gameState.clickIndices = {};
    }
    const currentIdx = gameState.clickIndices[hotspotId] || 0;
    const text = list[currentIdx % list.length];
    gameState.clickIndices[hotspotId] = currentIdx + 1;

    const gameViewport = document.getElementById("game-viewport");
    const rect = gameViewport.getBoundingClientRect();
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    speechBubble.style.left = `${x}px`;
    speechBubble.style.top = `${y - 15}px`;
    speechBubble.textContent = "";
    speechBubble.classList.remove("d-none");

    // Ocultar el HUD superior de forma inmediata al mostrar la frase
    if (hudText) {
      hudText.textContent = "";
    }
    gameState.activeBubble = true;

    playSound("snd-click");

    let i = 0;
    if (window.bubbleInterval) clearInterval(window.bubbleInterval);
    if (window.bubbleTimeout) clearTimeout(window.bubbleTimeout);

    window.bubbleInterval = setInterval(() => {
      speechBubble.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(window.bubbleInterval);
        
        window.bubbleTimeout = setTimeout(() => {
          speechBubble.classList.add("d-none");
          gameState.activeBubble = false;
        }, 3500);
      }
    }, 15);
  }

  // ===========================================================================
  // DESCARGA DE CV
  // ===========================================================================

  function downloadCV(english = false) {
    playSound("snd-success");
    
    fetch(`https://cv.drbarranco.es/api/cv/pdf?english=${english}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/pdf",
      },
    })
      .then(response => {
        if (!response.ok) throw new Error("Connection error");
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = english ? "Daniel_Rodriguez_CV_EN.pdf" : "Daniel_Rodriguez_CV.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error downloading CV:", error);
        alert("Puerto de descargas bloqueado. Por favor, inténtalo más tarde.");
      });
  }

  // ===========================================================================
  // IDIOMAS & MODALES
  // ===========================================================================

  function switchLanguage(lang) {
    gameState.lang = lang;
    localStorage.setItem("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    document.querySelectorAll(".game-lang-selector .lang-btn").forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-lang") === lang) btn.classList.add("active");
    });

    if (gameState.activeDialogueProject) {
      renderDialogueStep();
    }
  }

  // ===========================================================================
  // INICIALIZACIÓN
  // ===========================================================================

  document.addEventListener("DOMContentLoaded", () => {
    
    switchLanguage(gameState.lang);

    // ===========================================================================
    // SECUENCIA DE INTRODUCCIÓN RETRO
    // ===========================================================================
    const introOverlay = document.getElementById("intro-overlay");
    const introText = document.getElementById("intro-text");
    const introSkipBtn = document.getElementById("intro-skip-btn");
    let introTimeouts = [];

    function clearIntroTimeouts() {
      introTimeouts.forEach(t => clearTimeout(t));
      introTimeouts = [];
    }

    function finishIntro() {
      clearIntroTimeouts();
      if (introOverlay) {
        introOverlay.style.opacity = "0";
        introOverlay.style.pointerEvents = "none";
        setTimeout(() => {
          introOverlay.style.display = "none";
        }, 1000);
      }
    }

    // Verificar si ya se ha visto la intro en esta sesión
    if (sessionStorage.getItem("introSeen") === "true") {
      if (introOverlay) {
        introOverlay.style.opacity = "0";
        introOverlay.style.pointerEvents = "none";
        introOverlay.style.display = "none";
      }
    } else {
      sessionStorage.setItem("introSeen", "true");
      if (introOverlay && introText) {
        // Inicializar textos de la intro traducidos
        const lang = gameState.lang;
        if (translations[lang]) {
          introText.textContent = translations[lang]["intro_step_1"] || "Bienvenido...";
          if (introSkipBtn) introSkipBtn.textContent = translations[lang]["intro_skip"] || "[ OMITIR ]";
        }

        // Paso 1: Mostrar primer texto
        introTimeouts.push(setTimeout(() => {
          introText.classList.add("visible");
        }, 200));

        // Paso 2: Ocultar primer texto
        introTimeouts.push(setTimeout(() => {
          introText.classList.remove("visible");
        }, 2200));

        // Paso 3: Cargar y mostrar segundo texto
        introTimeouts.push(setTimeout(() => {
          introText.setAttribute("data-i18n", "intro_step_2");
          if (translations[lang]) {
            introText.textContent = translations[lang]["intro_step_2"] || "Explora el despacho...";
          }
          introText.classList.add("visible");
        }, 2800));

        // Paso 4: Ocultar segundo texto
        introTimeouts.push(setTimeout(() => {
          introText.classList.remove("visible");
        }, 4800));

        // Paso 5: Ocultar pantalla de intro y revelar oficina
        introTimeouts.push(setTimeout(() => {
          finishIntro();
        }, 5400));
      }
    }

    if (introSkipBtn) {
      introSkipBtn.addEventListener("click", () => {
        playSound("snd-click");
        finishIntro();
      });
    }

    // Si se viene desde portfolio-details.html tras pulsar "contáctame" en repo privado
    if (sessionStorage.getItem("openContact") === "true") {
      sessionStorage.removeItem("openContact");
      // Esperar a que el despacho esté visible antes de hacer zoom
      setTimeout(() => {
        applyZoom("hot-taza");
        setTimeout(() => {
          openDialoguePanel("hablemos");
        }, 600);
      }, 400);
    }

    hudText = document.getElementById("hud-action-text");
    
    document.querySelectorAll(".hotspot").forEach(hot => {
      // Mouse Enter
      hot.addEventListener("mouseenter", function () {
        if (gameState.activeZoom || gameState.activeBubble) return;
        const rawLabel = this.getAttribute("data-label");
        const parts = rawLabel.split(" | ");
        const labels = {};
        parts.forEach(p => {
          const sub = p.split(": ");
          labels[sub[0].trim()] = sub[1].trim();
        });
        if (hudText) hudText.textContent = labels[gameState.lang];
      });

      // Mouse Leave
      hot.addEventListener("mouseleave", function () {
        if (hudText && !gameState.activeZoom) hudText.textContent = "";
      });

      // Clic interactivo en los hotspots SVG de la habitación
      hot.addEventListener("click", function (e) {
        if (gameState.activeZoom) return; // Bloquear clics paralelos

        const hotId = this.getAttribute("id");
        const currentIdx = gameState.clickIndices[hotId] || 0;

        if (zoomSettings[hotId]) {
          applyZoom(hotId);
        } else {
          triggerSpeechBubble(hotId, e.clientX, e.clientY);
        }
      });
    });

    // VINCULACIÓN DE BALIZAS PULSANTES DE PRECISIÓN (HTML BEACONS)
    document.querySelectorAll(".hotspot-beacon").forEach(beacon => {
      const targetId = beacon.getAttribute("data-target");
      const targetHotspot = document.getElementById(targetId);

      if (!targetHotspot) return;

      // Sincronizar hover con barra de acción superior
      beacon.addEventListener("mouseenter", () => {
        if (gameState.activeZoom || gameState.activeBubble) return;
        const rawLabel = targetHotspot.getAttribute("data-label");
        const parts = rawLabel.split(" | ");
        const labels = {};
        parts.forEach(p => {
          const sub = p.split(": ");
          labels[sub[0].trim()] = sub[1].trim();
        });
        if (hudText) hudText.textContent = labels[gameState.lang];
      });

      beacon.addEventListener("mouseleave", () => {
        if (hudText && !gameState.activeZoom) hudText.textContent = "";
      });

      // Sincronizar click directo para disparar el zoom o globo de diálogo sin intermediarios
      beacon.addEventListener("click", (e) => {
        if (gameState.activeZoom) return;
        
        playSound("snd-click");
        const currentIdx = gameState.clickIndices[targetId] || 0;

        if (zoomSettings[targetId]) {
          applyZoom(targetId);
        } else {
          triggerSpeechBubble(targetId, e.clientX, e.clientY);
        }
      });
    });

    // BOTONES DE CONTROL SUPERIOR (HTML REAL)
    const btnLight = document.getElementById("btn-light");
    const btnAmbientSound = document.getElementById("btn-ambient-sound");
    const btnMenuToggle = document.getElementById("btn-menu-toggle");

    if (btnLight) {
      btnLight.addEventListener("click", () => {
        document.body.classList.toggle("ambient-night");
        playSound("snd-click");
      });
    }

    if (btnAmbientSound) {
      btnAmbientSound.addEventListener("click", function() {
        const ambient = document.getElementById("snd-ambient");
        if (ambient) {
          ambient.volume = 0.4;
          if (ambient.paused) {
            ambient.play().catch(() => {});
            this.classList.add("playing");
          } else {
            ambient.pause();
            this.classList.remove("playing");
          }
          playSound("snd-click");
        }
      });
    }

    if (btnMenuToggle) {
      btnMenuToggle.addEventListener("click", () => {
        playSound("snd-glitch");
        const modalOverlay = document.getElementById("modal-overlay");
        if (modalOverlay) modalOverlay.classList.remove("d-none");
      });
    }

    // BOTONES DE MENÚ INFERIOR (HTML REAL) DESPLEGABLE
    const btnToggleBottomMenu = document.getElementById("btn-toggle-bottom-menu");
    const bottomMenuBar = document.querySelector(".bottom-menu-bar");

    const menuCv = document.getElementById("menu-cv");
    const menuExp = document.getElementById("menu-exp");
    const menuProj = document.getElementById("menu-proj");
    const menuTech = document.getElementById("menu-tech");
    const menuEdu = document.getElementById("menu-edu");
    const menuChat = document.getElementById("menu-chat");

    function closeBottomMenu() {
      if (bottomMenuBar && bottomMenuBar.classList.contains("active")) {
        bottomMenuBar.classList.remove("active");
        const toggleIcon = btnToggleBottomMenu ? btnToggleBottomMenu.querySelector(".toggle-icon") : null;
        const toggleText = btnToggleBottomMenu ? btnToggleBottomMenu.querySelector(".toggle-text") : null;
        if (toggleIcon) toggleIcon.textContent = "☰";
        if (toggleText) {
          toggleText.setAttribute("data-i18n", "menu_toggle_open");
          toggleText.textContent = translations[gameState.lang]["menu_toggle_open"];
        }
      }
    }

    if (btnToggleBottomMenu && bottomMenuBar) {
      btnToggleBottomMenu.addEventListener("click", () => {
        playSound("snd-click");
        const isActive = bottomMenuBar.classList.toggle("active");
        const toggleIcon = btnToggleBottomMenu.querySelector(".toggle-icon");
        const toggleText = btnToggleBottomMenu.querySelector(".toggle-text");
        
        if (isActive) {
          if (toggleIcon) toggleIcon.textContent = "✕";
          if (toggleText) {
            toggleText.setAttribute("data-i18n", "menu_toggle_close");
            toggleText.textContent = translations[gameState.lang]["menu_toggle_close"];
          }
        } else {
          if (toggleIcon) toggleIcon.textContent = "☰";
          if (toggleText) {
            toggleText.setAttribute("data-i18n", "menu_toggle_open");
            toggleText.textContent = translations[gameState.lang]["menu_toggle_open"];
          }
        }
      });
    }

    if (menuCv) {
      menuCv.addEventListener("click", () => {
        closeBottomMenu();
        resetZoom();
        setTimeout(() => openDialoguePanel("curriculum"), 200);
      });
    }

    if (menuExp) {
      menuExp.addEventListener("click", () => {
        closeBottomMenu();
        resetZoom();
        setTimeout(() => openDialoguePanel("experiencia"), 200);
      });
    }

    if (menuProj) {
      menuProj.addEventListener("click", () => {
        closeBottomMenu();
        resetZoom();
        setTimeout(() => openDialoguePanel("timelink"), 200);
      });
    }

    if (menuTech) {
      menuTech.addEventListener("click", () => {
        closeBottomMenu();
        resetZoom();
        setTimeout(() => applyZoom("hot-estanteria"), 200);
      });
    }

    if (menuEdu) {
      menuEdu.addEventListener("click", () => {
        closeBottomMenu();
        resetZoom();
        setTimeout(() => applyZoom("hot-pizarra"), 200);
      });
    }

    if (menuChat) {
      menuChat.addEventListener("click", () => {
        closeBottomMenu();
        resetZoom();
        setTimeout(() => applyZoom("hot-taza"), 200);
      });
    }

    // Botón de Volver zoom-out
    const btnZoomOut = document.getElementById("btn-zoom-out");
    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => {
        resetZoom();
      });
    }

    // Cerrar modal
    const btnCloseModal = document.getElementById("btn-close-modal");
    const modalOverlay = document.getElementById("modal-overlay");

    if (btnCloseModal) {
      btnCloseModal.addEventListener("click", () => {
        playSound("snd-click");
        if (modalOverlay) modalOverlay.classList.add("d-none");
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", function(e) {
        if (e.target === this) {
          playSound("snd-click");
          this.classList.add("d-none");
        }
      });
    }

    // Descarga desde el modal rápido
    document.getElementById("downloadCV-modal").addEventListener("click", () => downloadCV(false));
    document.getElementById("downloadCV-en-modal").addEventListener("click", () => downloadCV(true));

    // Selector de idiomas
    document.querySelectorAll(".game-lang-selector .lang-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        const target = this.getAttribute("data-lang");
        switchLanguage(target);
      });
    });
  });

})();

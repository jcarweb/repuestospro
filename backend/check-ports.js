const { exec } = require('child_process');
const net = require('net');

// Función para verificar si un puerto está disponible
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Función para obtener el PID del proceso que usa un puerto
function getProcessUsingPort(port) {
  return new Promise((resolve, reject) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            resolve(pid);
            return;
          }
        }
      }
      resolve(null);
    });
  });
}

// Función para matar un proceso por PID
function killProcess(pid) {
  return new Promise((resolve, reject) => {
    exec(`taskkill /PID ${pid} /F`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Función para obtener información del proceso
function getProcessInfo(pid) {
  return new Promise((resolve, reject) => {
    exec(`tasklist /FI "PID eq ${pid}"`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Función principal
async function checkAndFreePort(port) {
  console.log(`🔍 Verificando puerto ${port}...`);
  
  const isAvailable = await isPortAvailable(port);
  
  if (isAvailable) {
    console.log(`✅ Puerto ${port} está disponible`);
    return true;
  }
  
  console.log(`❌ Puerto ${port} está ocupado`);
  
  const pid = await getProcessUsingPort(port);
  if (!pid) {
    console.log(`⚠️  No se pudo identificar el proceso usando el puerto ${port}`);
    return false;
  }
  
  console.log(`📋 Proceso usando puerto ${port}: PID ${pid}`);
  
  try {
    const processInfo = await getProcessInfo(pid);
    console.log(`📄 Información del proceso:\n${processInfo}`);
  } catch (error) {
    console.log(`⚠️  No se pudo obtener información del proceso: ${error.message}`);
  }
  
  console.log(`🛑 ¿Deseas terminar el proceso PID ${pid}? (s/n)`);
  
  // En un entorno real, aquí podrías usar readline para obtener input del usuario
  // Por ahora, asumimos que sí
  try {
    await killProcess(pid);
    console.log(`✅ Proceso PID ${pid} terminado`);
    
    // Verificar si el puerto está libre ahora
    const nowAvailable = await isPortAvailable(port);
    if (nowAvailable) {
      console.log(`✅ Puerto ${port} ahora está disponible`);
      return true;
    } else {
      console.log(`❌ Puerto ${port} aún está ocupado`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error terminando proceso: ${error.message}`);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const port = process.argv[2] || 5000;
  checkAndFreePort(port)
    .then((success) => {
      if (success) {
        console.log('🎉 Puerto liberado exitosamente');
      } else {
        console.log('💥 No se pudo liberar el puerto');
      }
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
    });
}

module.exports = { checkAndFreePort, isPortAvailable }; 
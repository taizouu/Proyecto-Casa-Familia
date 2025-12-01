import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login.jsx';
import SocioForm from './components/SocioForm.jsx';
import UsuarioForm from './components/UsuarioForm.jsx';
import PaymentStatus from './components/PaymentStatus.jsx';
import ResumenCaptador from './components/ResumenCaptador.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import JefeTurnoDashboard from './components/JefeTurnoDashboard.jsx'; 
import apiClient from './api.jsx'; 

const dashboardStyles = {
  mainContainer: {
    minHeight: '100vh',
    backgroundColor: '#f4f7f6',
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    paddingBottom: '40px'
  },
  navbar: {
    backgroundColor: '#ffffff',
    padding: '15px 40px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '4px solid #3498db',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: { fontSize: '1.4em', fontWeight: '800', color: '#2c3e50', margin: 0, letterSpacing: '-0.5px' },
  logoAccent: { color: '#3498db' },
  userArea: { display: 'flex', alignItems: 'center', gap: '20px' },
  userName: { color: '#34495e', fontWeight: '600', fontSize: '0.95em' },
  logoutButton: {
    padding: '8px 20px', backgroundColor: 'white', border: '1px solid #e74c3c',
    color: '#e74c3c', borderRadius: '6px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.9em', transition: 'all 0.3s ease',
  },
  contentWrapper: {
    maxWidth: '1200px', margin: '0 auto', padding: '0 20px',
    animation: 'fadeIn 0.4s ease-in-out'
  },
  backButton: {
    background: 'none', border: 'none', color: '#7f8c8d',
    cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '20px', padding: '5px 0'
  },
  searchContainer: {
    backgroundColor: 'white', padding: '25px', borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eaeaea',
    maxWidth: '800px', margin: '0 auto'
  },
  searchInput: {
    width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #dfe6e9',
    fontSize: '1rem', marginBottom: '20px', outline: 'none',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)'
  },
  resultItem: {
    padding: '15px', borderBottom: '1px solid #f1f2f6',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }
};

const menuStyles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    marginTop: '40px'
  },
  cardBtn: {
    backgroundColor: 'white',
    padding: '40px 30px',
    borderRadius: '20px',
    border: '1px solid #eaeaea',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  iconBox: {
    width: '80px', height: '80px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2.5em', color: 'white', marginBottom: '10px'
  },
  title: { fontWeight: '800', color: '#2c3e50', fontSize: '1.4em', margin: 0 },
  desc: { color: '#95a5a6', fontSize: '1em', lineHeight: '1.5' }
};

function App() {
  const [token, setToken] = useState(null);
  const [rol, setRol] = useState(null); 
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [vistaActual, setVistaActual] = useState('menu');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [sociosEncontrados, setSociosEncontrados] = useState([]);
  const [todosLosSocios, setTodosLosSocios] = useState([]); 

  const guardarToken = (tokenAcceso) => {
    try {
        const datosUsuario = jwtDecode(tokenAcceso);
        setToken(tokenAcceso);
        setRol(datosUsuario.rol);
        setNombreUsuario(datosUsuario.nombre || "Usuario"); 
        setVistaActual('menu'); 
    } catch (e) {
        console.error("Token inválido:", e);
        cerrarSesion();
    }
  };

  const cerrarSesion = () => {
    setToken(null);
    setRol(null);
    setNombreUsuario('');
    setVistaActual('menu');
  };

  useEffect(() => {
    if (vistaActual === 'buscar' && token) {
        apiClient.get('/gestion/mi-resumen/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            setTodosLosSocios(data);
            setSociosEncontrados(data);
        }).catch(err => {
            console.error("Error cargando socios:", err);
            setTodosLosSocios([]);
            setSociosEncontrados([]);
        });
    }
  }, [vistaActual, token]);

  useEffect(() => {
    if (!terminoBusqueda) {
        setSociosEncontrados(todosLosSocios);
        return;
    }

    try {
        const busqueda = terminoBusqueda.toLowerCase();
        
        const filtrados = todosLosSocios.filter(s => {
            const nombre = (s.nombre || '').toLowerCase();
            const apellido = (s.apellido_paterno || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const rut = (s.rut || '').toLowerCase();

            return nombre.includes(busqueda) || 
                   apellido.includes(busqueda) || 
                   email.includes(busqueda) || 
                   rut.includes(busqueda);
        });
        
        setSociosEncontrados(filtrados);
    } catch (error) {
        console.error("Error en el filtrado:", error);
        setSociosEncontrados([]);
    }
  }, [terminoBusqueda, todosLosSocios]);


  const Dashboard = () => {

    const renderContenido = () => {

      if (rol === 'Jefe de Turno') { 
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <JefeTurnoDashboard token={token} />
            </div>
        );
      }

      if (rol === 'Administrador') {
        switch (vistaActual) {
          case 'menu':
            return (
              <div style={menuStyles.grid}>
                <div 
                  style={menuStyles.cardBtn}
                  onClick={() => setVistaActual('admin_bi')}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{...menuStyles.iconBox, backgroundColor: '#8e44ad'}}>📊</div>
                  <h3 style={menuStyles.title}>Reporte BI</h3>
                  <p style={menuStyles.desc}>Visualiza métricas, recaudación y estadísticas en tiempo real.</p>
                </div>

                <div 
                  style={menuStyles.cardBtn}
                  onClick={() => setVistaActual('admin_staff')}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{...menuStyles.iconBox, backgroundColor: '#2980b9'}}>👥</div>
                  <h3 style={menuStyles.title}>Gestión de Staff</h3>
                  <p style={menuStyles.desc}>Registra nuevos captadores y administra el equipo.</p>
                </div>
              </div>
            );
          
          case 'admin_bi':
            return <AdminDashboard token={token} />; // Tu componente con el iframe
          
          case 'admin_staff':
            return (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <UsuarioForm token={token} />
                </div>
            );
            
          default: return <div>Opción no válida</div>;
        }
      }

      if (rol === 'Captador') {
        switch (vistaActual) {
          case 'menu':
            return (
              <div style={menuStyles.grid}>
                <div 
                  style={menuStyles.cardBtn}
                  onClick={() => setVistaActual('registro')}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{...menuStyles.iconBox, backgroundColor: '#3498db'}}>📝</div>
                  <h3 style={menuStyles.title}>Registrar Donante</h3>
                  <p style={menuStyles.desc}>Ingresa un nuevo socio y genera su link de pago.</p>
                </div>

                <div 
                  style={menuStyles.cardBtn}
                  onClick={() => setVistaActual('resumen')}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{...menuStyles.iconBox, backgroundColor: '#2ecc71'}}>🎯</div>
                  <h3 style={menuStyles.title}>Mi Progreso</h3>
                  <p style={menuStyles.desc}>Revisa tu meta mensual y el estado de tus captaciones.</p>
                </div>

                <div 
                  style={menuStyles.cardBtn}
                  onClick={() => setVistaActual('buscar')}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{...menuStyles.iconBox, backgroundColor: '#f39c12'}}>🔍</div>
                  <h3 style={menuStyles.title}>Buscar Socios</h3>
                  <p style={menuStyles.desc}>Encuentra donantes por nombre o RUT.</p>
                </div>
              </div>
            );

          case 'registro':
            return (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <SocioForm token={token} />
                </div>
            );

          case 'resumen':
            return (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <ResumenCaptador token={token} />
                </div>
            );
          
          case 'buscar':
            return (
                <div style={dashboardStyles.searchContainer}>
                    <h2 style={{color: '#2c3e50', marginBottom: '20px'}}>Búsqueda de Socios</h2>
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, apellido, RUT o email..." 
                        style={dashboardStyles.searchInput}
                        value={terminoBusqueda}
                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                        autoFocus
                    />
                    
                    <div>
                        {sociosEncontrados.length === 0 ? (
                            <p style={{textAlign:'center', color:'#999'}}>No se encontraron resultados.</p>
                        ) : (
                            sociosEncontrados.map(s => (
                                <div key={s.id} style={dashboardStyles.resultItem}>
                                    <div>
                                        <div style={{fontWeight:'bold', color:'#2c3e50'}}>{s.nombre} {s.apellido_paterno}</div>
                                        <div style={{fontSize:'0.9em', color:'#7f8c8d'}}>{s.rut} | {s.email}</div>
                                    </div>
                                    <span style={{
                                        padding: '5px 10px', borderRadius: '15px', fontSize: '0.8em', fontWeight: 'bold',
                                        backgroundColor: s.estado_donacion === 'Completada' ? '#eafaf1' : '#fff3cd',
                                        color: s.estado_donacion === 'Completada' ? '#27ae60' : '#f39c12'
                                    }}>
                                        {s.estado_donacion}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );

          default: return <div>Opción no válida</div>;
        }
      }
    };

    return (
      <div style={dashboardStyles.mainContainer}>
        <nav style={dashboardStyles.navbar}>
          <div style={dashboardStyles.logo}>
            Casa Familia <span style={dashboardStyles.logoAccent}>Manager</span>
          </div>
          <div style={dashboardStyles.userArea}>
             <span style={dashboardStyles.userName}>👋 Hola, {nombreUsuario}</span>
             <button onClick={cerrarSesion} style={dashboardStyles.logoutButton}>Cerrar Sesión</button>
          </div>
        </nav>
        <div style={dashboardStyles.contentWrapper}>
          {vistaActual !== 'menu' && (
            <button 
                onClick={() => setVistaActual('menu')}
                style={dashboardStyles.backButton}
            >
                ⬅ Volver al Menú Principal
            </button>
          )}

          {!rol ? (
            <div style={{textAlign:'center', marginTop:50, color:'#999'}}>Cargando perfil...</div>
          ) : (
            renderContenido()
          )}

        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/payment-status" element={<PaymentStatus />} />
      <Route path="/login" element={!token ? <Login enLoginExitoso={guardarToken} /> : <Navigate to="/" replace />} />
      <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import apiClient from '../api.jsx'; 

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #eee'
  },
  header: { marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' },
  title: { margin: 0, color: '#2c3e50' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#7f8c8d', fontSize: '0.9em' },
  input: { width: '100%', padding: '10px', border: '1px solid #dfe6e9', borderRadius: '6px', fontSize: '1rem' },
  select: { width: '100%', padding: '10px', border: '1px solid #dfe6e9', borderRadius: '6px', fontSize: '1rem', backgroundColor: 'white' },
  button: { width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  msgBox: { padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9em', textAlign: 'center' }
};

function UsuarioForm({ token }) {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rolId, setRolId] = useState(''); 
  
  const [listaRoles, setListaRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null); 

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const res = await apiClient.get('/auth/roles/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setListaRoles(res.data);
        if (res.data.length > 0) setRolId(res.data[0].id); 
      } catch (err) {
        console.error("Error cargando roles:", err);
        setMensaje({ tipo: 'error', texto: 'Error al conectar con el servidor para cargar roles.' });
      }
    };
    if (token) cargarRoles();
  }, [token]);

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    if (!rut || !nombre || !apellido || !email || !password || !rolId) {
        setMensaje({ tipo: 'error', texto: 'Todos los campos son obligatorios.' });
        setLoading(false);
        return;
    }

    const datosUsuario = {
        rut: rut,
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: password,
        rol: rolId 
    };

    try {
        const res = await apiClient.post('/auth/usuarios/', datosUsuario, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Usuario creado:", res.data);
        setMensaje({ tipo: 'exito', texto: `¡Usuario ${res.data.nombre} creado correctamente!` });
        setRut(''); setNombre(''); setApellido(''); setEmail(''); setPassword('');

    } catch (err) {
        console.error("Error al crear:", err);
        let errorTxt = "Ocurrió un error al crear el usuario.";
        
        if (err.response && err.response.data) {
            errorTxt = JSON.stringify(err.response.data);
        }
        setMensaje({ tipo: 'error', texto: errorTxt });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Alta de Staff</h3>
      </div>

      {mensaje && (
        <div style={{
            ...styles.msgBox, 
            backgroundColor: mensaje.tipo === 'error' ? '#fadbd8' : '#d5f5e3',
            color: mensaje.tipo === 'error' ? '#c0392b' : '#27ae60'
        }}>
            {mensaje.texto}
        </div>
      )}

      <form onSubmit={manejarRegistro}>
        <div style={styles.inputGroup}>
            <label style={styles.label}>RUT</label>
            <input 
                type="text" placeholder="12.345.678-9" style={styles.input}
                value={rut} onChange={(e) => setRut(e.target.value)} 
            />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre</label>
                <input 
                    type="text" style={styles.input}
                    value={nombre} onChange={(e) => setNombre(e.target.value)} 
                />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Apellido</label>
                <input 
                    type="text" style={styles.input}
                    value={apellido} onChange={(e) => setApellido(e.target.value)} 
                />
            </div>
        </div>

        <div style={styles.inputGroup}>
            <label style={styles.label}>Email Corporativo</label>
            <input 
                type="email" style={styles.input}
                value={email} onChange={(e) => setEmail(e.target.value)} 
            />
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Contraseña</label>
                <input 
                    type="password" style={styles.input}
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
            <div style={styles.inputGroup}>
                <label style={styles.label}>Rol</label>
                <select 
                    style={styles.select}
                    value={rolId} onChange={(e) => setRolId(e.target.value)}
                >
                    {listaRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                </select>
            </div>
        </div>

        <button type="submit" style={{...styles.button, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? 'Guardando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
}

export default UsuarioForm;
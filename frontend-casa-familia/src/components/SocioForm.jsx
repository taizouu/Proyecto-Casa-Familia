import React, { useState, useEffect } from 'react';
import apiClient from '../api.jsx'; 

const COMUNAS_RM = [
    "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
    "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja",
    "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado",
    "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia",
    "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín",
    "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "San Bernardo"
].sort();

const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    border: 'none',
    position: 'relative',
    overflow: 'hidden'
  },
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: '8px',
    backgroundColor: '#0984e3',
  },
  title: {
    color: '#0984e3', fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px',
    textAlign: 'center', fontFamily: "'Poppins', sans-serif"
  },
  inputGroup: { marginBottom: '18px' },
  label: {
    display: 'block', marginBottom: '8px', color: '#636e72',
    fontWeight: '600', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif"
  },
  input: {
    width: '100%', padding: '14px 20px', border: '1px solid #dfe6e9',
    borderRadius: '50px', fontSize: '0.95rem', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.3s',
    fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9f9f9'
  },
  select: { 
    width: '100%', padding: '14px 20px', border: '1px solid #dfe6e9',
    borderRadius: '50px', fontSize: '0.95rem', outline: 'none',
    boxSizing: 'border-box', transition: 'all 0.3s',
    fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9f9f9',
    cursor: 'pointer', appearance: 'none' 
  },
  button: {
    width: '100%', padding: '16px', backgroundColor: '#0984e3',
    color: 'white', border: 'none', borderRadius: '50px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
    marginTop: '15px', boxShadow: '0 5px 15px rgba(9, 132, 227, 0.3)',
    transition: 'transform 0.2s', fontFamily: "'Poppins', sans-serif"
  }
};

function SocioForm({ token }) {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [email, setEmail] = useState('');
  const [zona, setZona] = useState(''); 
  const [campanaId, setCampanaId] = useState(''); 
  const [listaCampanas, setListaCampanas] = useState([]); 
  const [monto, setMonto] = useState('');
  const [metodoPagoId, setMetodoPagoId] = useState('');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null); 
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
        try {
            const resMetodos = await apiClient.get('/transacciones/metodos-pago/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(resMetodos.data.length > 0) setMetodoPagoId(resMetodos.data[0].id);

            const resCampanas = await apiClient.get('/transacciones/campanas/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const activas = resCampanas.data.filter(c => c.activa === true);
            setListaCampanas(activas);
            
            if(activas.length > 0) setCampanaId(activas[0].id);

        } catch(e) {
            console.error("Error cargando datos:", e);
        }
    };
    if (token) cargarDatos();
  }, [token]);

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError(null); setExito(null); setPaymentUrl(null); setQrImage(null);

    const datosSocio = {
      rut, nombre, apellido_paterno: apellidoPaterno, email, zona,
    };

    try {
      const resSocio = await apiClient.post('/gestion/socios/', datosSocio, { 
          headers: { Authorization: `Bearer ${token}` } 
      });
      
      const nuevoSocioId = resSocio.data.id;
      setExito(`Socio creado. Generando pago...`);

      const datosDonacion = {
        id_socio: nuevoSocioId,
        id_metodo_pago: metodoPagoId,
        id_campana: campanaId || null, 
        monto: monto,
      };

      const resDonacion = await apiClient.post('/transacciones/donaciones/iniciar_transaccion/', datosDonacion, { 
          headers: { Authorization: `Bearer ${token}` } 
      });

      const { url_pago, qr_image } = resDonacion.data;
      setPaymentUrl(url_pago); setQrImage(qr_image); 
      setExito(`¡Listo! Escanea el código para donar.`);
      setRut(''); setNombre(''); setApellidoPaterno(''); setEmail(''); setZona(''); setMonto('');

    } catch (err) {
      console.error(err);
      setError('Error al procesar el registro.');
    }
  };

  if (qrImage) {
    return (
        <div style={{...styles.card, textAlign:'center'}}>
            <div style={styles.topBar}></div>
            <h3 style={{...styles.title, color:'#27ae60'}}>¡Escanea para Pagar!</h3>
            <img src={qrImage} alt="QR" style={{width:'200px', margin:'10px auto'}} />
            <p style={{color:'#7f8c8d'}}>Enviado a: {email}</p>
            <button onClick={() => {setQrImage(null); setExito(null);}} style={{...styles.button, backgroundColor:'#95a5a6'}}>
                Nuevo Registro
            </button>
        </div>
    );
  }

  return (
    <form onSubmit={manejarRegistro} style={styles.card}>
      <div style={styles.topBar}></div>
      <h3 style={styles.title}>Nuevo Donante</h3>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Evento / Campaña</label>
        <select 
            value={campanaId} 
            onChange={(e) => setCampanaId(e.target.value)} 
            style={styles.select}
            required
        >
            {listaCampanas.length === 0 && <option value="">Sin campañas activas</option>}
            {listaCampanas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
        </select>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>RUT</label>
        <input type="text" placeholder="Ej: 12.345.678-9" value={rut} onChange={e => setRut(e.target.value)} style={styles.input} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
            <label style={styles.label}>Apellido</label>
            <input type="text" value={apellidoPaterno} onChange={e => setApellidoPaterno(e.target.value)} style={styles.input} required />
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Email</label>
        <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={styles.inputGroup}>
            <label style={styles.label}>Comuna</label>
            <select 
                value={zona} 
                onChange={(e) => setZona(e.target.value)} 
                style={styles.select}
                required
            >
                <option value="" disabled>Seleccione...</option>
                {COMUNAS_RM.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
        </div>
        
        <div style={styles.inputGroup}>
            <label style={styles.label}>Monto ($)</label>
            <input type="number" placeholder="5000" value={monto} onChange={e => setMonto(e.target.value)} style={styles.input} required />
        </div>
      </div>

      {error && <p style={{color:'red', textAlign:'center'}}>{error}</p>}
      {exito && <p style={{color:'green', textAlign:'center'}}>{exito}</p>}

      <button type="submit" style={styles.button}>Generar Link de Pago</button>
    </form>
  );
}

export default SocioForm;
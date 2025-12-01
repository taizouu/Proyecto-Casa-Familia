import React, { useState, useEffect } from 'react';
import apiClient from '../api.jsx';

const styles = {
    container: {
        animation: 'fadeIn 0.5s',
        paddingBottom: '40px'
    },
    cardCreate: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        marginBottom: '30px',
        border: '1px solid #eaeaea'
    },
    title: { color: '#2c3e50', marginBottom: '20px', fontSize: '1.2em', fontWeight: 'bold' },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        alignItems: 'end'
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '0.9em', fontWeight: '600', color: '#7f8c8d' },
    input: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #dfe6e9',
        fontSize: '1rem'
    },
    btnCreate: {
        padding: '12px 20px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        height: '45px'
    },
    listTitle: { color: '#34495e', marginBottom: '15px', fontSize: '1.1em', fontWeight: 'bold', borderLeft: '4px solid #3498db', paddingLeft: '10px' },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #eaeaea'
    },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
        color: '#7f8c8d',
        fontSize: '0.9em'
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr',
        padding: '15px',
        borderBottom: '1px solid #f1f2f6',
        alignItems: 'center',
        fontSize: '0.95em'
    },
    statusBadge: (activo) => ({
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '0.8em',
        fontWeight: 'bold',
        backgroundColor: activo ? '#eafaf1' : '#fadbd8',
        color: activo ? '#27ae60' : '#e74c3c',
        width: 'fit-content',
        cursor: 'pointer',
        userSelect: 'none'
    }),
    btnAction: {
        background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', padding: '5px'
    }
};

function JefeTurnoDashboard({ token }) {
    const [campanas, setCampanas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nombre, setNombre] = useState('');
    const [meta, setMeta] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);

    const cargarCampanas = async () => {
        try {
            const res = await apiClient.get('/transacciones/campanas/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCampanas(res.data);
        } catch (error) {
            console.error("Error cargando campañas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) cargarCampanas();
    }, [token]);

    const handleCrear = async (e) => {
        e.preventDefault();

        if (!nombre || !meta || !fechaInicio) {
            alert("Por favor completa todos los campos.");
            return;
        }

        const payload = {
            nombre: nombre,
            meta_recaudacion: parseInt(meta), 
            fecha_inicio: fechaInicio,
            activa: true
        };

        console.log("📤 Enviando nueva campaña:", payload);

        try {
            const res = await apiClient.post('/transacciones/campanas/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("✅ Campaña creada:", res.data);
            alert(`¡Evento "${res.data.nombre}" creado exitosamente!`);
            setNombre(''); setMeta('');
            cargarCampanas();

        } catch (error) {
            console.error("❌ Error al crear:", error.response || error);
            
            let msg = "Error al crear campaña.";
            if (error.response && error.response.data) {
                msg = JSON.stringify(error.response.data);
            }
            alert(msg);
        }
    };

    const toggleEstado = async (campana) => {
        try {
            await apiClient.patch(`/transacciones/campanas/${campana.id}/`, {
                activa: !campana.activa
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarCampanas();
        } catch (error) {
            console.error(error);
            alert("No se pudo cambiar el estado");
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este evento?")) return;
        try {
            await apiClient.delete(`/transacciones/campanas/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarCampanas();
        } catch (error) {
            console.error(error);
            alert("No se puede eliminar. Probablemente ya tiene donaciones asociadas.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.cardCreate}>
                <h3 style={styles.title}>🚀 Lanzar Nuevo Evento</h3>
                <form onSubmit={handleCrear} style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nombre del Evento</label>
                        <input 
                            style={styles.input} 
                            placeholder="Ej: Colecta Nacional 2025" 
                            value={nombre} onChange={e => setNombre(e.target.value)} required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Meta ($)</label>
                        <input 
                            type="number" style={styles.input} 
                            placeholder="1000000" 
                            value={meta} onChange={e => setMeta(e.target.value)} required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Fecha Inicio</label>
                        <input 
                            type="date" style={styles.input} 
                            value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required
                        />
                    </div>
                    <button type="submit" style={styles.btnCreate}>Crear Evento</button>
                </form>
            </div>

            <h3 style={styles.listTitle}>Gestión de Eventos Activos</h3>
            
            {loading ? <p>Cargando...</p> : (
                <div style={styles.tableContainer}>
                    <div style={styles.tableHeader}>
                        <span>Nombre</span>
                        <span>Meta</span>
                        <span>Fecha</span>
                        <span>Estado</span>
                        <span>Acción</span>
                    </div>
                    
                    {campanas.length === 0 ? (
                        <div style={{padding:'20px', textAlign:'center', color:'#999'}}>
                            No hay campañas registradas.
                        </div>
                    ) : (
                        campanas.map(c => (
                            <div key={c.id} style={styles.tableRow}>
                                <strong style={{color:'#2c3e50'}}>{c.nombre}</strong>
                                <span>${parseInt(c.meta_recaudacion || 0).toLocaleString('es-CL')}</span>
                                <span style={{color:'#7f8c8d', fontSize:'0.9em'}}>{c.fecha_inicio}</span>
                                
                                <div 
                                    style={styles.statusBadge(c.activa)} 
                                    onClick={() => toggleEstado(c)}
                                    title="Clic para pausar/activar"
                                >
                                    {c.activa ? 'ACTIVA ●' : 'PAUSADA ○'}
                                </div>

                                <button 
                                    onClick={() => handleEliminar(c.id)}
                                    style={{...styles.btnAction, color:'#e74c3c'}}
                                    title="Eliminar Campaña"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default JefeTurnoDashboard;
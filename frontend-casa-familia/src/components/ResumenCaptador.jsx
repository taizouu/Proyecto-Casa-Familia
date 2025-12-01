import React, { useState, useEffect } from 'react';
import apiClient from '../api.jsx';

const styles = {
    container: {
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #eaeaea',
        height: 'fit-content'
    },
    sectionTitle: {
        color: '#57606f',
        fontSize: '1.1em',
        fontWeight: '700',
        marginBottom: '20px',
        marginTop: 0
    },
    metaContainer: {
        marginBottom: '25px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef'
    },
    metaHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        color: '#2c3e50',
        fontWeight: '600',
        fontSize: '0.95em'
    },
    progressBarBg: {
        width: '100%',
        height: '10px',
        backgroundColor: '#e0e0e0',
        borderRadius: '10px',
        overflow: 'hidden'
    },

    statsRow: {
        display: 'flex',
        gap: '15px',
        marginBottom: '25px'
    },
    statBadge: {
        flex: 1,
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    statNumber: { fontSize: '1.8em', fontWeight: 'bold' },
    statLabel: { fontSize: '0.9em', fontWeight: '600' },

    listTitle: {
        fontSize: '0.85em',
        color: '#95a5a6',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '15px'
    },
    listItem: {
        padding: '12px 0',
        borderBottom: '1px solid #f1f2f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statusText: { fontSize: '0.8em', fontWeight: '700', textTransform: 'uppercase' }
};

function ResumenCaptador({ token }) {
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const META_MENSUAL = 20; 

    useEffect(() => {
        const cargar = async () => {
            if (!token) return;
            try {
                const res = await apiClient.get('/gestion/mi-resumen/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSocios(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [token]);

    if (loading) return <p>Cargando datos...</p>;

    const completadas = socios.filter(s => s.estado_donacion === 'Completada');
    const pendientes = socios.filter(s => s.estado_donacion === 'Pendiente' || s.estado_donacion === 'Fallida');
    const progreso = Math.min((completadas.length / META_MENSUAL) * 100, 100);
    const colorBarra = progreso >= 100 ? '#2ecc71' : '#3498db'; 

    return (
        <div style={styles.container} id="seccion-resumen"> 
            
            <h3 style={styles.sectionTitle}>Panel de Control</h3>

            <div style={styles.metaContainer}>
                <div style={styles.metaHeader}>
                    <span>🚀 Meta Mensual</span>
                    <span>{completadas.length} / {META_MENSUAL} Socios</span>
                </div>
                <div style={styles.progressBarBg}>
                    <div style={{
                        width: `${progreso}%`, 
                        height: '100%', 
                        backgroundColor: colorBarra, 
                        borderRadius: '10px',
                        transition: 'width 1s ease-in-out'
                    }}></div>
                </div>
                <div style={{textAlign:'right', fontSize:'0.8em', color:'#7f8c8d', marginTop:'5px'}}>
                    {progreso < 100 ? `¡Faltan ${META_MENSUAL - completadas.length} para la meta!` : '¡Meta cumplida! 🎉'}
                </div>
            </div>

            <div style={styles.statsRow}>
                <div style={{...styles.statBadge, backgroundColor: '#eafaf1', color: '#27ae60'}}>
                    <span style={styles.statNumber}>{completadas.length}</span>
                    <span style={styles.statLabel}>Completados</span>
                </div>
                <div style={{...styles.statBadge, backgroundColor: '#fff8e1', color: '#e67e22'}}>
                    <span style={styles.statNumber}>{pendientes.length}</span>
                    <span style={styles.statLabel}>Pendientes</span>
                </div>
            </div>

            <h4 style={styles.listTitle}>Últimos Registros</h4>
            <div>
                {socios.length === 0 && <p style={{color:'#ccc', fontSize:'0.9em'}}>Sin registros.</p>}
                {socios.slice(0, 5).map(s => (
                    <div key={s.id || Math.random()} style={styles.listItem}>
                        <div>
                            <div style={{fontWeight:'bold', color:'#333'}}>{s.nombre} {s.apellido_paterno}</div>
                            <div style={{fontSize:'0.85em', color:'#999'}}>{s.email}</div>
                        </div>
                        <span style={{
                            ...styles.statusText, 
                            color: s.estado_donacion === 'Completada' ? '#2ecc71' : '#e67e22'
                        }}>
                            {s.estado_donacion}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResumenCaptador;
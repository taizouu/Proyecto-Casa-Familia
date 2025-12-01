import React from 'react';
import { useSearchParams } from 'react-router-dom';

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f9f4', 
        fontFamily: "'Poppins', sans-serif",
        padding: '20px',
        textAlign: 'center'
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        maxWidth: '450px', // Un poco más ancho para el video
        width: '100%',
        animation: 'fadeInUp 0.5s ease-out'
    },
    iconCircle: {
        width: '80px',
        height: '80px',
        backgroundColor: '#eafaf1',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 20px auto'
    },
    checkIcon: { fontSize: '40px', color: '#27ae60' },
    title: { color: '#27ae60', fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' },
    message: { color: '#7f8c8d', fontSize: '1rem', marginBottom: '20px' },
    
    // Contenedor del video responsivo
    videoWrapper: {
        position: 'relative',
        paddingBottom: '56.25%', // Ratio 16:9
        height: 0,
        overflow: 'hidden',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    iframe: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none'
    },

    dataBox: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left' },
    dataRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' },
    dataLabel: { fontWeight: '600', color: '#34495e' },
    dataValue: { color: '#7f8c8d' },
    footer: { marginTop: '20px', fontSize: '0.85rem', color: '#95a5a6' }
};

function PaymentStatus() {
    const [searchParams] = useSearchParams();
    const estado = searchParams.get('estado'); 
    const monto = searchParams.get('monto');
    const transaccionId = searchParams.get('id');
    const fecha = new Date().toLocaleDateString('es-CL');

    // --- AQUÍ PONES TU LINK DE YOUTUBE ---
    // Importante: Usa la versión "embed" (incrustar). 
    // Si tu link es https://www.youtube.com/watch?v=dQw4w9WgXcQ
    // Debes usar: https://www.youtube.com/embed/dQw4w9WgXcQ
    const youtubeVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1"; 

    // CASO 1: ÉXITO
    if (!estado || estado === 'exito') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconCircle}>
                        <span style={styles.checkIcon}>✅</span>
                    </div>
                    <h1 style={styles.title}>¡Gracias por tu aporte!</h1>
                    <p style={styles.message}>
                        Tu donación hace posible nuestra misión. Mira este mensaje especial para ti:
                    </p>
                    
                    {/* VIDEO DE YOUTUBE */}
                    <div style={styles.videoWrapper}>
                        <iframe 
                            style={styles.iframe}
                            src={youtubeVideoUrl} 
                            title="Gracias por donar"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>

                    {(monto || transaccionId) && (
                        <div style={styles.dataBox}>
                            {monto && (
                                <div style={styles.dataRow}>
                                    <span style={styles.dataLabel}>Monto:</span>
                                    <span style={styles.dataValue}>${parseInt(monto).toLocaleString('es-CL')}</span>
                                </div>
                            )}
                            <div style={styles.dataRow}>
                                <span style={styles.dataLabel}>Fecha:</span>
                                <span style={styles.dataValue}>{fecha}</span>
                            </div>
                            {transaccionId && (
                                <div style={styles.dataRow}>
                                    <span style={styles.dataLabel}>ID Transacción:</span>
                                    <span style={styles.dataValue}>#{transaccionId}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={styles.footer}>
                        <p>Puedes cerrar esta ventana.</p>
                        <small>© 2025 Fundación Casa Familia</small>
                    </div>
                </div>
            </div>
        );
    }

    // CASO 2: FALLIDO
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={{...styles.iconCircle, backgroundColor: '#fdecea'}}>
                    <span style={{...styles.checkIcon, color: '#e74c3c'}}>❌</span>
                </div>
                <h1 style={{...styles.title, color: '#e74c3c'}}>Algo salió mal</h1>
                <p style={styles.message}>
                    No pudimos procesar tu donación. Por favor, intenta nuevamente o contacta al captador.
                </p>
                <div style={styles.footer}>
                    <small>© 2025 Fundación Casa Familia</small>
                </div>
            </div>
        </div>
    );
}

export default PaymentStatus;
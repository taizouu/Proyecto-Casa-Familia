import React, { useState } from 'react';
import UsuarioForm from './UsuarioForm.jsx';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'fadeIn 0.5s ease-in-out',
        paddingTop: '10px'
    },

    tabContainer: {
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '0'
    },
    tab: {
        padding: '12px 25px',
        cursor: 'pointer',
        fontWeight: '600',
        color: '#95a5a6',
        borderBottom: '3px solid transparent',
        transition: 'all 0.2s',
        fontSize: '1rem',
        backgroundColor: 'transparent',
        borderRadius: '5px 5px 0 0'
    },
    activeTab: {
        color: '#3498db',
        borderBottom: '3px solid #3498db',
        backgroundColor: '#f8f9fa'
    },
 
    powerBiWrapper: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #eaeaea',
        height: '80vh', 
        overflow: 'hidden'
    },
    iframe: { width: '100%', height: '100%', border: 'none' }
};

function AdminDashboard({ token }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    

    const powerBiUrl = "https://app.powerbi.com/view?r=eyJrIjoiY2IwOGE4ZWItODA0ZS00ODdhLWI4MmUtOGJiZDRkMzlhNmY1IiwidCI6IjM4YTFlMGExLWI2YjEtNDJlOS1iM2E5LTU5NzYyNjY3MGIxNyIsImMiOjR9";

    return (
        <div style={styles.container}>
            <div style={styles.tabContainer}>
                <div 
                    style={activeTab === 'dashboard' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Reporte de Gestión (BI)
                </div>
                <div 
                    style={activeTab === 'usuarios' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                    onClick={() => setActiveTab('usuarios')}
                >
                    👥 Gestión de Staff
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <div style={styles.powerBiWrapper}>
                    <iframe 
                        title="Reporte Casa Familia"
                        src={powerBiUrl} 
                        style={styles.iframe}
                        allowFullScreen={true}
                    ></iframe>
                </div>
            )}

            {activeTab === 'usuarios' && (
                <div style={{ maxWidth: '800px', margin: '30px auto' }}>
                    <UsuarioForm token={token} />
                </div>
            )}

        </div>
    );
}

export default AdminDashboard;
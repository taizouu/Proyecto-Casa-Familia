import React, { useState } from 'react';
import axios from 'axios';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh', 
        backgroundColor: '#f4f7f6', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
        width: '100%',
        maxWidth: '400px',
        borderTop: '5px solid #3498db', 
    },
    title: {
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '10px',
        marginTop: 0,
        fontSize: '1.8em'
    },
    subtitle: {
        textAlign: 'center',
        color: '#7f8c8d',
        marginBottom: '30px',
        fontSize: '0.95em'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#34495e',
        fontWeight: '600',
        fontSize: '0.9em'
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #bdc3c7',
        fontSize: '1em',
        outline: 'none',
        transition: 'border-color 0.3s',
        boxSizing: 'border-box' 
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#3498db', 
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.1s',
        marginTop: '10px'
    },
    buttonHover: {
        backgroundColor: '#2980b9'
    },
    errorBox: {
        backgroundColor: '#fdecea', 
        color: '#e74c3c',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '0.9em',
        textAlign: 'center',
        borderLeft: '4px solid #e74c3c'
    },
    footer: {
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '0.85em',
        color: '#95a5a6'
    },
    accent: {
        color: '#f1c40f', 
        fontWeight: 'bold'
    }
};

function Login({ enLoginExitoso }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isHover, setIsHover] = useState(false);

    const manejarLogin = async (evento) => {
        evento.preventDefault();
        setError(null);
        setLoading(true);

        try {

            const respuesta = await axios.post(
                'http://127.0.0.1:8000/api/auth/token/',
                {
                    email: email, 
                    password: password,
                }
            );

            console.log('¡Login exitoso!');
            enLoginExitoso(respuesta.data.access);

        } catch (err) {
            console.error('Error en el login:', err);
            if (err.response && err.response.data) {
                alert("ERROR DEL SERVIDOR: " + JSON.stringify(err.response.data));
            }
            if (err.response && err.response.status === 401) {
                setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
            } else {
                setError('No se pudo conectar con el servidor. Intenta más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Bienvenido</h2>
                <p style={styles.subtitle}>
                    Portal de Captación <span style={styles.accent}>Casa Familia</span>
                </p>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={manejarLogin}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@casafamilia.cl"
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={styles.input}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={isHover ? {...styles.button, ...styles.buttonHover} : styles.button}
                        onMouseEnter={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>© 2025 Fundación Casa Familia</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
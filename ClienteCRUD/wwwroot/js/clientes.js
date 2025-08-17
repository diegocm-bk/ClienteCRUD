// clientes.js (drop-in replacement)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cliente-form');
    const errorBox = document.getElementById('error-box');
    const tbody = document.querySelector('#clientes-table tbody');

    // ============ Utilidades ============
    const isJson = (res) =>
        res.headers.get('content-type')?.toLowerCase().includes('application/json');

    const safeJson = async (res) => {
        // 204/205: sin cuerpo
        if (res.status === 204 || res.status === 205) return null;
        // contenido vacío
        const len = res.headers.get('content-length');
        if (len === '0') return null;
        // si no es JSON, devolvemos texto
        if (!isJson(res)) return await res.text();
        return await res.json();
    };

    const showError = (msg) => {
        if (!errorBox) return;
        errorBox.textContent = msg;
        errorBox.classList.remove('is-hidden');
    };

    const clearError = () => {
        if (!errorBox) return;
        errorBox.textContent = '';
        errorBox.classList.add('is-hidden');
    };

    const resetForm = () => {
        form.reset();
        document.getElementById('cliente-id').value = '';
    };

    const renderRows = (data) => {
        tbody.innerHTML = '';
        (data || []).forEach((c) => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${c.nombre ?? ''}</td>
        <td>${c.apellido ?? ''}</td>
        <td>${c.email ?? ''}</td>
        <td>${c.telefono ?? ''}</td>
        <td>${c.direccion ?? ''}</td>
        <td>
          <button class="button is-small is-info edit-btn" data-id="${c.id}">Editar</button>
          <button class="button is-small is-danger delete-btn" data-id="${c.id}">Eliminar</button>
        </td>`;
            tbody.appendChild(row);
        });
    };

    // ============ Carga ============
    async function loadClientes() {
        try {
            const res = await fetch('/api/clientes', { method: 'GET' });
            if (!res.ok) {
                const body = await safeJson(res);
                throw new Error(`HTTP ${res.status} ${typeof body === 'string' ? body : ''}`);
            }
            const data = await safeJson(res);
            renderRows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error cargando clientes', err);
            showError('Error cargando clientes');
        }
    }

    // ============ Guardar (POST/PUT) ============
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const id = document.getElementById('cliente-id').value;
        const cliente = {
            id: id ? parseInt(id, 10) : 0,
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: (document.getElementById('telefono').value || '').trim() || null,
            direccion: (document.getElementById('direccion').value || '').trim() || null
        };

        const url = id ? `/api/clientes/${id}` : '/api/clientes';
        const method = id ? 'PUT' : 'POST';

        // Deshabilitar botón para evitar doble submit
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn?.setAttribute('disabled', 'disabled');

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });

            const body = await safeJson(res);

            if (!res.ok) {
                // Intenta mostrar errores de modelo si vienen del API
                if (typeof body === 'object' && body) {
                    // ModelState típico: { errors: { Campo: [mensajes...] } } o diccionario
                    const modelErrors = [];
                    if (body.errors) {
                        for (const k in body.errors) {
                            modelErrors.push(`${k}: ${body.errors[k].join(', ')}`);
                        }
                    }
                    if (modelErrors.length) {
                        throw new Error(modelErrors.join(' | '));
                    }
                }
                throw new Error(typeof body === 'string' ? body : `HTTP ${res.status}`);
            }

            resetForm();
            await loadClientes();
        } catch (err) {
            console.error(err);
            showError('Error guardando cliente');
        } finally {
            submitBtn?.removeAttribute('disabled');
        }
    });

    // ============ Editar / Eliminar ============
    document.getElementById('clientes-table').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        // Editar
        if (btn.classList.contains('edit-btn')) {
            const id = btn.dataset.id;
            try {
                const res = await fetch(`/api/clientes/${id}`);
                const body = await safeJson(res);
                if (!res.ok) throw new Error(typeof body === 'string' ? body : `HTTP ${res.status}`);
                const c = body || {};
                document.getElementById('cliente-id').value = c.id ?? '';
                document.getElementById('nombre').value = c.nombre ?? '';
                document.getElementById('apellido').value = c.apellido ?? '';
                document.getElementById('email').value = c.email ?? '';
                document.getElementById('telefono').value = c.telefono ?? '';
                document.getElementById('direccion').value = c.direccion ?? '';
            } catch (err) {
                console.error(err);
                showError('Error obteniendo cliente');
            }
        }

        // Eliminar
        if (btn.classList.contains('delete-btn')) {
            const id = btn.dataset.id;
            if (!confirm('¿Eliminar cliente?')) return;

            try {
                const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
                const body = await safeJson(res); // puede ser 204
                if (!res.ok) throw new Error(typeof body === 'string' ? body : `HTTP ${res.status}`);
                await loadClientes();
            } catch (err) {
                console.error(err);
                showError('Error eliminando cliente');
            }
        }
    });

    // Inicial
    loadClientes();
});

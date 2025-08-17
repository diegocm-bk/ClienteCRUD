document.addEventListener('DOMContentLoaded', () => {
    loadClientes();
    const form = document.getElementById('cliente-form');
    const errorBox = document.getElementById('error-box');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.classList.add('is-hidden');
        const id = document.getElementById('cliente-id').value;
        const cliente = {
            id: id ? parseInt(id) : 0,
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            direccion: document.getElementById('direccion').value.trim()
        };
        try {
            const response = await fetch('/api/clientes' + (id ? '/' + id : ''), {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cliente)
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }
            form.reset();
            document.getElementById('cliente-id').value = '';
            loadClientes();
        } catch (err) {
            errorBox.textContent = 'Error guardando cliente';
            errorBox.classList.remove('is-hidden');
            console.error(err);
        }
    });

    document.getElementById('clientes-table').addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const res = await fetch('/api/clientes/' + id);
            if (res.ok) {
                const c = await res.json();
                document.getElementById('cliente-id').value = c.id;
                document.getElementById('nombre').value = c.nombre;
                document.getElementById('apellido').value = c.apellido;
                document.getElementById('email').value = c.email;
                document.getElementById('telefono').value = c.telefono || '';
                document.getElementById('direccion').value = c.direccion || '';
            }
        } else if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('¿Eliminar cliente?')) {
                const res = await fetch('/api/clientes/' + id, { method: 'DELETE' });
                if (res.ok) {
                    loadClientes();
                }
            }
        }
    });
});

async function loadClientes() {
    const tbody = document.querySelector('#clientes-table tbody');
    tbody.innerHTML = '';
    try {
        const res = await fetch('/api/clientes');
        const data = await res.json();
        data.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${c.nombre}</td>
                <td>${c.apellido}</td>
                <td>${c.email}</td>
                <td>${c.telefono || ''}</td>
                <td>${c.direccion || ''}</td>
                <td>
                    <button class="button is-small is-info edit-btn" data-id="${c.id}">Editar</button>
                    <button class="button is-small is-danger delete-btn" data-id="${c.id}">Eliminar</button>
                </td>`;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error cargando clientes', err);
    }
}

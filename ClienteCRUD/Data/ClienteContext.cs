using Microsoft.EntityFrameworkCore;
using ClienteCRUD.Models;

namespace ClienteCRUD.Data
{
    public class ClienteContext : DbContext
    {
        public ClienteContext(DbContextOptions<ClienteContext> options) : base(options)
        {
        }

        public DbSet<Cliente> Clientes { get; set; } = null!;
    }
}

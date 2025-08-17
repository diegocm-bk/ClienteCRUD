using Microsoft.AspNetCore.Mvc;

namespace ClienteCRUD.Controllers
{
    public class ClientesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

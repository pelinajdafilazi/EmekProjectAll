namespace Emek.Application.DTOs.Request.Parents
{
    public class CreateMotherRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string NationalId { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string Occupation { get; set; }
    }

    public class UpdateMotherRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string NationalId { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string Occupation { get; set; }
    }

    public class FilterMotherRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? NationalId { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
    }

    public class MotherRequestDTO
    {
    }
}

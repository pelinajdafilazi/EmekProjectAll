using System;
using System.Collections.Generic;

namespace Emek.Application.DTOs.Responses.Parents
{
    public class MotherResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string NationalId { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string Occupation { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class MotherListResponse
    {
        public List<MotherResponse> Mothers { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class MotherResponseDTO
    {
    }
}

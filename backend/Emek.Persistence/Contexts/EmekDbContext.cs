using Microsoft.EntityFrameworkCore;
using Emek.Domain.Entities.Parents;
using Emek.Domain.Entities.Personal;
using Emek.Domain.Entities.Groups;
using Emek.Domain.Entities.Lessons;
using Emek.Domain.Entities.Debts;
using Emek.Domain.Entities.Attendances;

namespace Emek.Persistence.Contexts
{
    public class EmekDbContext : DbContext
    {
        public EmekDbContext(DbContextOptions<EmekDbContext> options)
            : base(options)
        {
        }

        // DbSetler
        public DbSet<StudentPersonalInfo> StudentPersonalInfos { get; set; }
        public DbSet<StudentMotherInfo> StudentMotherInfos { get; set; }
        public DbSet<StudentFatherInfo> StudentFatherInfos { get; set; }
        public DbSet<Relatives> Relatives { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupStudent> GroupStudents { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<LessonStudent> LessonStudents { get; set; }
        public DbSet<Debt> Debts { get; set; }
        public DbSet<Attendance> Attendances { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // StudentPersonalInfo - StudentMotherInfo İlişkisi (1-M)
            modelBuilder.Entity<StudentPersonalInfo>()
                .HasOne(s => s.Mother)
                .WithMany(m => m.Students)
                .HasForeignKey(s => s.MotherId)
                .OnDelete(DeleteBehavior.Restrict); // Anne silinirse öğrenci silinmesin

            // StudentPersonalInfo - StudentFatherInfo İlişkisi (1-M)
            modelBuilder.Entity<StudentPersonalInfo>()
                .HasOne(s => s.Father)
                .WithMany(f => f.Students)
                .HasForeignKey(s => s.FatherId)
                .OnDelete(DeleteBehavior.Restrict); // Baba silinirse öğrenci silinmesin

            // NationalId için Unique Index
            modelBuilder.Entity<StudentPersonalInfo>()
                .HasIndex(s => s.NationalId)
                .IsUnique();

            modelBuilder.Entity<StudentMotherInfo>()
                .HasIndex(m => m.NationalId)
                .IsUnique();

            modelBuilder.Entity<StudentFatherInfo>()
                .HasIndex(f => f.NationalId)
                .IsUnique();

            // StudentPersonalInfo - Relatives (1-M)
            modelBuilder.Entity<Relatives>()
                .HasOne(r => r.Student)
                .WithMany(s => s.Relatives)
                .HasForeignKey(r => r.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Group - Student (1-M)
            modelBuilder.Entity<GroupStudent>()
                .HasOne(gs => gs.Group)
                .WithMany(g => g.GroupStudents)
                .HasForeignKey(gs => gs.GroupId);

            modelBuilder.Entity<GroupStudent>()
                .HasOne(gs => gs.Student)
                .WithMany()
                .HasForeignKey(gs => gs.StudentId);

            // Aynı öğrencinin aynı grupta birden fazla aktif kaydı olmasın
            modelBuilder.Entity<GroupStudent>()
                .HasIndex(gs => new { gs.GroupId, gs.StudentId, gs.IsActive });

            // Lesson - Group İlişkisi (M-1)
            modelBuilder.Entity<Lesson>()
                .HasOne(l => l.Group)
                .WithMany()
                .HasForeignKey(l => l.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            // Lesson - Student (1-M)
            modelBuilder.Entity<LessonStudent>()
                .HasOne(ls => ls.Lesson)
                .WithMany(l => l.LessonStudents)
                .HasForeignKey(ls => ls.LessonId);

            modelBuilder.Entity<LessonStudent>()
                .HasOne(ls => ls.Student)
                .WithMany()
                .HasForeignKey(ls => ls.StudentId);

            // Aynı öğrencinin aynı derste birden fazla kaydını engeller
            modelBuilder.Entity<LessonStudent>()
                .HasIndex(ls => new { ls.LessonId, ls.StudentId, ls.IsActive });

            // Student - Debt İlişkisi (1-M)
            modelBuilder.Entity<Debt>()
                .HasOne(d => d.Student)
                .WithMany(s => s.Debts)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Attendance - Lesson İlişkisi (M-1)
            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Lesson)
                .WithMany()
                .HasForeignKey(a => a.LessonId)
                .OnDelete(DeleteBehavior.Restrict);

            // Attendance - Student İlişkisi (M-1)
            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Student)
                .WithMany()
                .HasForeignKey(a => a.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Aynı öğrencinin aynı derste aynı tarihte birden fazla kaydını engelle
            modelBuilder.Entity<Attendance>()
                .HasIndex(a => new { a.LessonId, a.StudentId, a.AttendanceDate, a.IsActive });
        }
    }
}
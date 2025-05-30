using Schedule = VttTools.Data.Game.Entities.Schedule;

namespace VttTools.Data.Builders;

internal static class ScheduleSchemaBuilder {
    public static void ConfigureModel(ModelBuilder builder)
        => builder.Entity<Schedule>(entity => {
            entity.ToTable("Schedule");
            entity.HasKey(e => e.Id);
            entity.Property(s => s.OwnerId).IsRequired();
            entity.Property(s => s.EventId);
            entity.OwnsMany(e => e.Participants, pb => {
                pb.ToTable("Participants");
                pb.WithOwner().HasForeignKey("ScheduleId");
                pb.HasKey("ScheduleId", "UserId");
                pb.Property(t => t.UserId).IsRequired();
                pb.Property(t => t.IsRequired).IsRequired();
                pb.Property(t => t.Type).IsRequired();
            });
            entity.Property(s => s.Start).IsRequired();
            entity.Property(s => s.Duration).IsRequired();
            entity.ComplexProperty(s => s.Recurrence, rb => {
                rb.Property(s => s.Frequency).IsRequired().HasConversion<string>().HasDefaultValue(Frequency.Daily);
                rb.Property(s => s.Interval).IsRequired().HasDefaultValue(1);
                rb.PrimitiveCollection(s => s.Days).IsRequired().HasDefaultValue(new List<int>());
                rb.Property(s => s.UseWeekdays).IsRequired();
                rb.Property(s => s.Count).IsRequired().HasDefaultValue(1);
                rb.Property(s => s.Until).IsRequired(false);
            });
        });
}

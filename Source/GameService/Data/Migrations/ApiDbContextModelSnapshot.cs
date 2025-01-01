﻿// <auto-generated />
using GameService.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace GameService.Data.Migrations {
    [DbContext(typeof(GameServiceDbContext))]
    partial class ApiDbContextModelSnapshot : ModelSnapshot {
        protected override void BuildModel(ModelBuilder modelBuilder) {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("GameService.Data.Model.ApiClient", b => {
                b.Property<string>("Id")
                    .HasMaxLength(200)
                    .HasColumnType("nvarchar(200)");

                b.Property<string>("HashedSecret")
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnType("nvarchar(200)");

                b.HasKey("Id");

                b.ToTable("Clients");

                b.HasData(
                    new {
                        Id = "VttToolsWebApp",
                        HashedSecret = "AQAAAAIAAYagAAAAEDutt3FAy41C6n8dL7T9pqHWJbgOX8J/Fan4cSPw/SMA95gpziNIsQGYD6/PorZUTw=="
                    });
            });
#pragma warning restore 612, 618
        }
    }
}

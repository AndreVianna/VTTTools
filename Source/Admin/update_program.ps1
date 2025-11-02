$content = Get-Content "Program.cs" -Raw
$content = $content -replace '(\s+builder\.Services\.AddScoped<IAuditLogStorage, AuditLogStorage>\(\);)', '$1`r`n        builder.Services.AddSignalR();'
$content = $content -replace '(internal static void MapApplicationEndpoints\(this IEndpointRouteBuilder app\))\s*=>\s*app\.MapAdminAuthEndpoints\(\);', '$1 {`r`n        app.MapAdminAuthEndpoints();`r`n        app.MapAuditLogEndpoints();`r`n        app.MapHub<VttTools.Admin.Hubs.AuditLogHub>("/hubs/audit");`r`n    }'
Set-Content "Program.cs" -Value $content -NoNewline

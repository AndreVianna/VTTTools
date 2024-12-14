﻿using System.Diagnostics;

namespace WebApp.Pages;

public partial class Error {
    [CascadingParameter]
    private HttpContext? HttpContext { get; set; }

    private string? RequestId { get; set; }
    private bool ShowRequestId => !string.IsNullOrEmpty(RequestId);

    protected override void OnInitialized() => RequestId = Activity.Current?.Id ?? HttpContext?.TraceIdentifier;
}
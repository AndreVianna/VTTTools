namespace VttTools.Admin.Exceptions;

public sealed class LastAdminException : InvalidOperationException {
    public LastAdminException()
        : base("Cannot remove or lock the last administrator account.") { }

    public LastAdminException(string message) : base(message) { }

    public LastAdminException(string message, Exception innerException)
        : base(message, innerException) { }
}
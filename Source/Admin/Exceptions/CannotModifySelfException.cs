namespace VttTools.Admin.Exceptions;

public sealed class CannotModifySelfException : InvalidOperationException {
    public CannotModifySelfException()
        : base("Administrators cannot modify their own account.") { }

    public CannotModifySelfException(string message) : base(message) { }

    public CannotModifySelfException(string message, Exception innerException)
        : base(message, innerException) { }
}
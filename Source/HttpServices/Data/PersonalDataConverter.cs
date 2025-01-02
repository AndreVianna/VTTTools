namespace HttpServices.Data;

public sealed class PersonalDataConverter(IPersonalDataProtector protector)
    : ValueConverter<string, string>(s => protector.Protect(s), s => protector.Unprotect(s));

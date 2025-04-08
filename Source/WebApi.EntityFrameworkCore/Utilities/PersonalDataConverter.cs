namespace WebApi.EntityFrameworkCore.Utilities;

public class PersonalDataConverter(IPersonalDataProtector protector)
    : ValueConverter<string, string>(s => protector.Protect(s), s => protector.Unprotect(s));